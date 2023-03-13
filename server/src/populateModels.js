const   mongoose = require("mongoose"),
        fs = require("fs"),
        Article = require("./models/Article"),
        User = require("./models/User");
        
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
// const UserBadges = require("./models/UserBadges");
// const { USER_TYPE, COACH_APPROVAL_STATUS } = require("./interfaces");
// const path = require("path");

const DB = process.env.DB || "mongodb://localhost/finberry";

mongoose.connect(DB, () => {
    console.log("Database Connected");
    mongoose.connection.db.dropDatabase();
    console.log("Dropping current database");
  });


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}  

const addArticle = async (
    title,
    description,
    content,
    externalLink,
    firstPosted,
    lastUpdate,
) => {
    const article = new Article({
        title: title,
        description: description,
        content: content,
        externalLink: externalLink,
        firstPosted: firstPosted,
        lastUpdate: lastUpdate,
    })

    await article.save();
    console.log(`Article ${article} added`);
}

const addUser = async (
    email,
    username,
    firstName,
    lastName,
    preferredName,
    phoneNumber,
    dateOfBirth,
    permissionLevel,
    dateLastUpdated
) => {
    const user = new User({
        email: email,
        username: username,
        firstName: firstName,
        lastName: lastName,
        preferredName: preferredName,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        permissionLevel: permissionLevel,
        dateLastUpdated: dateLastUpdated
    })

    await user.save();
    console.log(`User ${user} added`);
}

const insertData = async () => {
    await sleep(1000);
    await addArticle(
        "article 1",
        "First article description",
        "content of first article",
        "link to first article",
        new Date(),
        new Date(),
    );
    await addArticle(
        "article 2",
        "Second article description",
        "content of second article",
        "https://www.google.ca/",
        new Date(),
        new Date(),
    );
    await addUser(
        "baseUser@finberry.com",
        "baseUser",
        "Base",
        "User",
        "Base",
        "01234567890",
        Date.now(),
        0,
        Date.now()
    );
    await addUser(
        "moderatorUser@finberry.com",
        "moderatorUser",
        "Moderator",
        "User",
        "Moderator",
        "01234567890",
        Date.now(),
        0,
        Date.now()
    );
    await addUser(
        "adminUser@finberry.com",
        "adminUser",
        "Admin",
        "User",
        "Admin",
        "01234567890",
        Date.now(),
        0,
        Date.now()
    );
}

insertData();