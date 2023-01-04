const mongoose = require("mongoose");
const fs = require("fs");
const Article = require("./models/Article");
//const Badge = require("./models/Badge");
// const ChatLog = require("./models/ChatLog");
// const Client = require("./models/Client");
// const Coaches = require("./models/Coaches");
// const CoachingProfile = require("./models/CoachingProfile");
// const Holding = require("./models/Holding");
// const ParticipatingUser = require("./models/ParticipatingUser");
// const PaymentHistory = require("./models/PaymentHistory");
// const PremiumPaymentHistory = require("./models/PremiumPaymentHistory");
// const PrivacySetting = require("./models/PrivacySetting");
// const Profile = require("./models/Profile");
// const Review = require("./models/Review");
// const Session = require("./models/Session");
// const Simulator = require("./models/Simulator");
// const TradeHistory = require("./models/TradeHistory");
// const User = require("./models/User");
// const UserBadges = require("./models/UserBadges");
// const { USER_TYPE, COACH_APPROVAL_STATUS } = require("./interfaces");
// const path = require("path");

const DB = process.env.DB || "mongodb://localhost/finberry";

mongoose.connect(DB, () => {
  console.log("Database Connected");
});

const addArticle = async (
    title,
    description,
    content,
    externalLink,
    firstPosted,
    lastUpdate
) => {
    const article = new Article({
        title: title,
        description: description,
        content: content,
        externalLink: externalLink,
        firstPosted: firstPosted,
        lastUpdate: lastUpdate
    })

    await article.save();
    console.log(`Article ${article} added`);
}

const insertData = async () => {
    await addArticle(
        "article 1",
        "First article description",
        "content first aticle",
        "link to first article",
        new Date(),
        new Date(),
    )
}

insertData();