const express = require("express");
const router = express.Router();
const Articles = require("../models/Article");
//for parsing multipart form data (images)
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//get all articles
router.get("/", async (req, res) => {
    try {
      const articles = await Articles.find();
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
      const article = await Articles.findOne({ title: req.params.title });
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
      return res.status(400).json({ msg: "Article is missing a field" });
    }
    
    try {
        const dbArticle = new Articles(article);
        await dbArticle.save();
        res.json(dbArticle);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

module.exports = router;