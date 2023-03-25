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
const   Article  =  mongoose.model("Article");



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


/* #region Article */

// POST - Create a article
// Note: Might want to make title unique somehow, issues with this right now.
router.post("/article", async (req, res) => {
  const article = {
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    externalLink: req.body.externalLink,
    firstPosted: req.body.firstPosted,
    dateLastUpdated: Date.now(),
  };

  if (
    !article.title ||
    !article.description ||
    !article.content ||
    !article.externalLink ||
    !article.firstPosted
  ) {
    return res.status(400).json({ msg: "Article is missing one or more required field(s)" });
  }
  
  try {
      const dbArticle = new Article(article);
      await dbArticle.save();
      res.json(dbArticle);
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

// GET - all article
router.get("/article", async (req, res) => {
  try {
    let articles;
    if (requestingTrueFalseParam(req.query, "moreDetails") == true) {
      articles = await Article.find(parseRequestParams(req.query, Article));
    }
    else {
      articles = await Article.find(parseRequestParams(req.query, Article),{content:0});
    }

    return autoManageOutput(res, req.query, articles, "Article");
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
});

// PUT - Edit article
router.put("/article/:articleID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.articleID) {
      return res.status(400).json({ msg: "Article ID is missing" });
    }
  
    try {
      const article = await Article.findById(req.params.articleID);
      if (!article) {
        return res.status(400).json({ msg: "Article with provided ID not found" });
      }

      article["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
      attrKeys.forEach((key) => {
        if (process.env.REACT_APP_DEVELOPMENT == "true") {
          article[key] = newAttrs[key]; // Admin access, complete changes
        }
        else {
          if (!['_id'].includes(key)) {
            article[key] = newAttrs[key];
          }
        }
      });
      await article.save();

      res.json(article);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// DELETE article completely
router.delete("/article/:articleID", async (req, res) => {
  if (!req.params.articleID) {
    return res.status(400).json({ msg: "Article ID is missing" });
  }
  try {
      const statusMessage = await Article.deleteOne({_id: req.params.articleID });
      return res.json(statusMessage);
    } catch (e) {
      return res.status(400).json({ msg: "Article deletion failed: " + e.message });
  }
});

// DELETE ALL Articles (IN REVERSIBLE - DEBUG ONLY!!!!)
router.delete("/article", async (req, res) => {
  if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
    try {
      let statusMessage = await Article.deleteMany();
      return res.json(statusMessage);
    } catch (e) {
      return res.status(400).json({ msg: "Articles deletions failed: " + e.message });
    }
  } else {
    return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
  }
});

/* #endregion */

module.exports = router;