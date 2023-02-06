const   mongoose = require("mongoose"),
        fs = require("fs"),
        Article = require("./models/Article");

const DB = process.env.DB || "mongodb://localhost/finberry";

mongoose.connect(DB, () => {
  console.log("Database Connected");
});

// const addArticle = async (currentDate) => {
//     // Function should delete any Stock Data in the database that is not of the past 7 days.

//     // const article = new Article({
//     //     title: title,
//     //     description: description,
//     //     content: content,
//     //     externalLink: externalLink,
//     //     firstPosted: firstPosted,
//     //     lastUpdate: lastUpdate
//     // })

//     // await article.save();
//     // console.log(`Article ${article} added`);
// }


// const addArticle = async (
//     title,
//     description,
//     content,
//     externalLink,
//     firstPosted,
//     lastUpdate
// ) => {
//     const article = new Article({
//         title: title,
//         description: description,
//         content: content,
//         externalLink: externalLink,
//         firstPosted: firstPosted,
//         lastUpdate: lastUpdate
//     })

//     await article.save();
//     console.log(`Article ${article} added`);
// }


// const dailyRefresh = async () => {



//     await addArticle(
//         // "article 1",
//         // "First article description",
//         // "content first aticle",
//         // "link to first article",
//         // new Date(),
//         // new Date(),
//     )

// }

// const funcName = () =>  {

//     return null;
// }