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


//get all article
router.get("/", async (req, res) => {
    try {
      const articles = await Article.find();
      res.json(articles);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

//get article by title
router.get("/title/:title", async (req, res) => {
    if (!req.params.title) {
      return res.status(400).json({ msg: "Article title is missing" });
    }
    try {
      const article = await Article.findOne({ title: req.params.title });
      if (!article) {
        return res.status(400).json({ msg: "Article not found" });
      }
      res.json(article);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

//create a article
router.post("/", async (req, res) => {
    const article = {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      externalLink: req.body.externalLink,
      firstPosted: req.body.firstPosted,
      lastUpdate: req.body.lastUpdate,
    };

    if (
      !article.title ||
      !article.description ||
      !article.content ||
      !article.externalLink ||
      !article.firstPosted ||
      !article.lastUpdate
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

module.exports = router;