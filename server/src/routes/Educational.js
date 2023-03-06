// Express and the routers
const   express =   require("express"),
        router  =   express.Router();

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// Relevant schemas
const   Article  =  require("../models/Article");

//create a article
// Note: Might want to make title unique somehow, issues with this right now.
router.post("/", async (req, res) => {
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

//get all article
router.get("/", async (req, res) => {
    try {
      const articles = await Article.find({},{title:1,description:1,externalLink:1,firstPosted:1,dateLastUpdated:1,_id:1});
      res.json(articles);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

//get article by title
router.get("/:articleID", async (req, res) => {
    if (!req.params.articleID) {
      return res.status(400).json({ msg: "Article ID is missing" });
    }
    try {
      const article = await Article.findById(req.params.articleID);
      if (!article) {
        return res.status(400).json({ msg: "Article not found" });
      }
      res.json(article);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit article
router.put("/", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!newAttrs._id) {
      return res.status(400).json({ msg: "Article id is missing" });
    }
  
    try {
      const article = await Article.findOne({ _id: newAttrs._id });
      attrKeys.forEach((key) => {
        if (key !== "_id" && key !== "firstPosted") {
          article[key] = newAttrs[key];
        }
      });
      await article.save();
      res.json(article);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});


// Deep delete article function
async function deepDeleteArticle(article_id) {
  let articleRemoved = await Article.findByIdAndRemove(article_id);
}

// DELETE article completely
router.delete("/:articleID", async (req, res) => {
  if (!req.params.articleID) {
    return res.status(400).json({ msg: "Article ID is missing" });
  }
  try {
      const article = await Article.findById(req.params.articleID);
      if (!article) {
        return res.status(400).json({ msg: "Article not found" });
      }
      
      await deepDeleteArticle(article._id);

      return res.json({ msg: "Article successfully deleted" });

    } catch (e) {
      return res.status(400).json({ msg: "Article deletion failed: " + e.message });
  }
});

// DELETE ALL Articles (IN REVERSIBLE - DEBUG ONLY!!!!)
router.delete("/", async (req, res) => {
  try {
      let allArticles = await Article.find({});

      allArticles.forEach(async (specificArticle) => {
          await deepDeleteArticle(specificArticle._id);
      });

      return res.json({ msg: "ALL Articles successfully deleted" });

    } catch (e) {
      return res.status(400).json({ msg: "Articles deletions failed: " + e.message });
  }
});

module.exports = router;