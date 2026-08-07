// Express and the routers
const   express  =   require("express"),
        router   =   express.Router(),
        mongoose =   require("mongoose");

module.exports  =   router;

// For parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// Relevant schemas
const   Lesson         =  mongoose.model("Lesson"),
        LessonProgress =  mongoose.model("LessonProgress"),
        User           =  mongoose.model("User");



/* #region Helper Functions */

// Super helpful parse param function
// Returns a json file of properly formatted parameters
function parseRequestParams(reqParams, desiredSchema) {
  let params = {};
  if (Object.keys(reqParams).length != 0) {
    let desiredAttrs = Object.keys(desiredSchema.schema.paths);
    desiredAttrs.forEach((key) => {
        if (reqParams[key]) {
          params[key] = reqParams[key];
        }
    });
  }

  return params;
}

// Returns true if reqParams has "desiredParam" set to "true", return false otherwise
function requestingTrueFalseParam(reqParams, desiredParam) {
  if (reqParams[desiredParam] === "true") {
      return true;
  }

  return false;
}

// If enforceSingleOutput is set to false, simply respond with entries, otherwise:
// Returns response if the size of the entries is 1. Else return a 400 message and show error Otherwise.
function autoManageOutput(response, reqParams, entries, entryTypeName) {
  // To account for enforcingSingleOutput options
  if (requestingTrueFalseParam(reqParams, "enforceSingleOutput") == true) {
      if (entries.length == 1) {
          return response.json(entries[0]);
      }
      else {
          return response.status(400).json({ msg: "Incorrect number of " + entryTypeName + " found based on query parameters.", foundNumberOfEntries: entries.length });
      }
  }
  else {
      response.json(entries);
  }
}

/* #endregion */



/* #region Lesson */

// Reading time from the body text, at a deliberate ~180 wpm for study material.
function estimateMinutes(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

// POST - Create a lesson
router.post("/lesson", async (req, res) => {
  const lesson = {
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    category: req.body.category,
    pathKey: req.body.pathKey ?? null,
    order: req.body.order,
    externalLink: req.body.externalLink || "N/A",
    author: req.body.author,
    firstPosted: req.body.firstPosted || Date.now(),
    dateLastUpdated: Date.now(),
  };

  // Use == null so a legitimate 0 for `order` is accepted.
  if (!lesson.title || !lesson.description || !lesson.content || !lesson.author) {
    return res.status(400).json({ msg: "Lesson is missing one or more required field(s)" });
  }
  if (lesson.order == null) {
    lesson.order = 0;
  }
  if (!lesson.category) {
    lesson.category = "Basics";
  }
  if (!Lesson.CATEGORIES.includes(lesson.category)) {
    return res.status(400).json({
      msg: "Unknown lesson category.",
      allowed: Lesson.CATEGORIES,
    });
  }

  lesson.estimatedMinutes = req.body.estimatedMinutes == null
    ? estimateMinutes(lesson.content)
    : Number(req.body.estimatedMinutes);

  try {
    const dbLesson = new Lesson(lesson);
    await dbLesson.save();
    res.json(dbLesson);
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

// GET - lessons. Body is omitted unless moreDetails=true, so the hub can list
// every lesson cheaply.
router.get("/lesson", async (req, res) => {
  try {
    let lessons;
    if (requestingTrueFalseParam(req.query, "moreDetails") == true) {
      lessons = await Lesson.find(parseRequestParams(req.query, Lesson)).sort({ order: 1, firstPosted: 1 });
    } else {
      lessons = await Lesson.find(parseRequestParams(req.query, Lesson), { content: 0 }).sort({ order: 1, firstPosted: 1 });
    }

    return autoManageOutput(res, req.query, lessons, "Lesson");
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

// GET - the categories the schema allows, so the client never hard-codes them.
router.get("/lesson/categories", (req, res) => {
  return res.json(Lesson.CATEGORIES);
});

// PUT - Edit lesson
router.put("/lesson/:lessonID", async (req, res) => {
  const newAttrs = req.body;
  const attrKeys = Object.keys(newAttrs);

  if (!req.params.lessonID) {
    return res.status(400).json({ msg: "Lesson ID is missing" });
  }

  try {
    const lesson = await Lesson.findById(req.params.lessonID);
    if (!lesson) {
      return res.status(404).json({ msg: "Lesson with provided ID not found" });
    }

    lesson["dateLastUpdated"] = Date.now();
    attrKeys.forEach((key) => {
      if (!["_id"].includes(key)) {
        lesson[key] = newAttrs[key];
      }
    });

    if (newAttrs.content != null && newAttrs.estimatedMinutes == null) {
      lesson.estimatedMinutes = estimateMinutes(newAttrs.content);
    }

    await lesson.save();
    res.json(lesson);
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

// DELETE a lesson, and any progress recorded against it
router.delete("/lesson/:lessonID", async (req, res) => {
  if (!req.params.lessonID) {
    return res.status(400).json({ msg: "Lesson ID is missing" });
  }
  try {
    const statusMessage = await Lesson.deleteOne({ _id: req.params.lessonID });
    await LessonProgress.deleteMany({ lesson: req.params.lessonID });
    return res.json(statusMessage);
  } catch (e) {
    return res.status(400).json({ msg: "Lesson deletion failed: " + e.message });
  }
});

// DELETE ALL lessons (IRREVERSIBLE - DEBUG ONLY)
router.delete("/lesson", async (req, res) => {
  if (process.env.REACT_APP_DEVELOPMENT == "true") {
    try {
      const statusMessage = await Lesson.deleteMany();
      await LessonProgress.deleteMany();
      return res.json(statusMessage);
    } catch (e) {
      return res.status(400).json({ msg: "Lesson deletions failed: " + e.message });
    }
  } else {
    return res.status(400).json({ msg: "You do not have permission to use development mode commands." });
  }
});

/* #endregion */


/* #region Lesson Progress */

// Resolve a user by email or id. Progress is per user, and the client knows
// the email rather than the id.
async function resolveUserId(query) {
  if (query.user) {
    return query.user;
  }
  if (query.email) {
    const user = await User.findOne({ email: query.email }, { _id: 1 });
    return user ? user._id : null;
  }
  return null;
}

// GET - progress for a user, optionally for one lesson
router.get("/lessonprogress", async (req, res) => {
  try {
    const userId = await resolveUserId(req.query);
    if (!userId) {
      return res.status(400).json({ msg: "A user id or email is required." });
    }

    const params = { user: userId };
    if (req.query.lesson) {
      params.lesson = req.query.lesson;
    }

    const progress = await LessonProgress.find(params);
    return res.json(progress);
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

// PUT - record progress for a lesson (upsert)
router.put("/lessonprogress", async (req, res) => {
  try {
    const userId = await resolveUserId(req.body);
    if (!userId) {
      return res.status(400).json({ msg: "A user id or email is required." });
    }
    if (!req.body.lesson) {
      return res.status(400).json({ msg: "A lesson id is required." });
    }

    // == null so an explicit 0 is honoured.
    const raw = req.body.percentComplete == null ? 100 : Number(req.body.percentComplete);
    if (!Number.isFinite(raw)) {
      return res.status(400).json({ msg: "percentComplete must be a number." });
    }
    const percentComplete = Math.min(100, Math.max(0, raw));

    const lesson = await Lesson.findById(req.body.lesson, { _id: 1 });
    if (!lesson) {
      return res.status(404).json({ msg: "Lesson with provided ID not found" });
    }

    const update = {
      percentComplete,
      lastViewedAt: Date.now(),
      completedAt: percentComplete >= 100 ? Date.now() : null,
    };

    const progress = await LessonProgress.findOneAndUpdate(
      { user: userId, lesson: req.body.lesson },
      { $set: update, $setOnInsert: { user: userId, lesson: req.body.lesson } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(progress);
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

/* #endregion */
