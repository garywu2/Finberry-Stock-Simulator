// Express and the routers
const   express =   require("express"),
        router  =   express.Router(),
        mongoose =  require("mongoose");

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// // Relevant schemas
const   User                =   mongoose.model("User"),
        CoachingProfile     =   mongoose.model("CoachingProfile"),
        Review              =   mongoose.model("Review"),
        CoachingClient      =   mongoose.model("CoachingClient"),
        CoachingCoach       =   mongoose.model("CoachingCoach"),
        CoachingSession     =   mongoose.model("CoachingSession"),
        ChatMessage         =   mongoose.model("ChatMessage"),
        PaymentHistory      =   mongoose.model("PaymentHistory"),
        Badge               =   mongoose.model("Badge"),
        UserBadge           =   mongoose.model("UserBadge");

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

// Returns the desiredParam if reqParams has it, else return null
function requestingSpecificParam(reqParams, desiredParam) {
    if (reqParams[desiredParam]) {
        return reqParams[desiredParam];
    }

    return null;
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



/* #region All Deep Delete Functions */

// User
async function deepDeleteUser(user_id) {
    let userRemoved = await User.findByIdAndRemove(user_id);

    // Delete all associated coaching profiles
    userRemoved.coachingProfiles.forEach(async (coachingProfileID) => {
        await deepDeleteCoachingProfile(coachingProfileID);
    });

    // Delete all attached UserBadges
    userRemoved.badges.forEach(async (userBadgeID) => {
        await deepDeleteUserBadge(userBadgeID);
    });

    // TODO: Remove all CoachingCoach and other cascading - user owned variables

    // Might want to also remove simulator reference such as SimulatorEnrollment but its ok if thats not deleted.
    // Since we might want to keep it in the leaderboard but say deleted user instead. But realistically, we should
    // never delete user.
}

// Badge
async function deepDeleteBadge(badgeID) {
    await Badge.findByIdAndRemove(badgeID);

    // Delete all associated UserBadge
    try {
        const userBadges = await UserBadge.find({ badgeType: badgeID });
        userBadges.forEach(async (userBadge) => {
            await deepDeleteUserBadge(userBadge._id);
        });
    } catch (e) {
    }
}

// UserBadge
async function deepDeleteUserBadge(userBadgeID) {
    return new Promise(async (resolve) => {
        let userBadgeRemoved = await UserBadge.findByIdAndRemove(userBadgeID);

        try {
            let userID = userBadgeRemoved.user;

            const user = await User.findById(userID);
            if (!user) {
                return; 
            }
            const index = user.badges.indexOf(userBadgeID);
            if (index > -1) { // only splice array when item is found
                user.badges.splice(index, 1); // 2nd parameter means remove one item only
            }
            await user.save();
        } catch (e) {
        }

        resolve(userBadgeRemoved);
    });
}

// Coaching Profile
async function deepDeleteCoachingProfile(coaching_profile_id) {
    let coachingProfileRemoved = await CoachingProfile.findByIdAndRemove(coaching_profile_id);

    try {
        // Must remove the entry from the user as well
        const ownerUserID = coachingProfileRemoved.user;

        const user = await User.findById(ownerUserID);
        if (!user) {
            return; // Then the user was already deleted (Somehow) then we do not need to do anything more.
        }
        // console.log(user.coachingProfiles); // Investigating bug
        const index = user.coachingProfiles.indexOf(coaching_profile_id);
        if (index > -1) { // only splice array when item is found
            user.coachingProfiles.splice(index, 1); // 2nd parameter means remove one item only
        }
        
        await user.save();
    } catch (e) {
    }

    // Use the deep delete function from review to remove all associated reviews
    coachingProfileRemoved.reviews.forEach(async (review) => {
        await deepDeleteReview(review._id);
    });
}

// Review
async function deepDeleteReview(reviewID) {
    let reviewRemoved = await Review.findByIdAndRemove(reviewID);

    try {
        let coachingProfileID = reviewRemoved.coachingProfile;

        const coachingProfile = await CoachingProfile.findById(coachingProfileID);
        if (!coachingProfile) {
            return; 
        }
        const index = coachingProfile.reviews.indexOf(reviewID);
        if (index > -1) { // only splice array when item is found
            coachingProfile.reviews.splice(index, 1); // 2nd parameter means remove one item only
        }
        await coachingProfile.save();
    } catch (e) {
    }
}

// Coaching Session
async function deepDeleteCoachingSession(toBeRemovedEntryID) {
    let coachingSessionRemoved = await CoachingSession.findByIdAndRemove(toBeRemovedEntryID);

    // Must remove the entry from CoachingClient and CoachingCoach as well.
    const coachingClientID = coachingSessionRemoved.coachingClient;
    const coachingCoachID = coachingSessionRemoved.coachingCoach;

    try { // For CoachingClient
        const entry = await CoachingClient.findById(coachingClientID);
        if (!entry) {
            return;
        }
        const index = entry.coachingSessions.indexOf(toBeRemovedEntryID);
        if (index > -1) { // only splice array when item is found
            entry.coachingSessions.splice(index, 1); // 2nd parameter means remove one item only
        }

        await entry.save();
    } catch (e) {
    }

    try { // For CoachingCoach
        const entry = await CoachingCoach.findById(coachingCoachID);
        if (!entry) {
            return;
        }
        const index = entry.coachingSessions.indexOf(toBeRemovedEntryID);
        if (index > -1) { // only splice array when item is found
            entry.coachingSessions.splice(index, 1); // 2nd parameter means remove one item only
        }

        await entry.save();
    } catch (e) {
    }
}

// Chat Message
async function deepDeleteChatMessage(toBeRemovedEntryID) {
    let chatMessageRemoved = await ChatMessage.findByIdAndRemove(toBeRemovedEntryID);

    // Must remove the entry from coachingSession as well.
    const coachingSessionID = chatMessageRemoved.coachingSession;

    try { // For CoachingSession
        const entry = await CoachingSession.findById(coachingSessionID);
        if (!entry) {
            return;
        }
        const index = entry.chatMessages.indexOf(toBeRemovedEntryID);
        if (index > -1) { // only splice array when item is found
            entry.chatMessages.splice(index, 1); // 2nd parameter means remove one item only
        }

        await entry.save();
    } catch (e) {
    }
}

// Payment History
async function deepDeletePaymentHistory(toBeRemovedEntryID) {
    let chatMessageRemoved = await PaymentHistory.findByIdAndRemove(toBeRemovedEntryID);

    // Maybe we should not be removing the reference from coaching session 
}

/* #endregion */



/* #region Normal User - And typical (non - coaching interactions) */

// GET user by email and username, determines if email or username is already taken beforehand - Special Get function
router.get("/user/:email/:username", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }
    if (!req.params.username) {
        return res.status(400).json({ msg: "Username is missing" });
    }

    try {
        let emailAvailable = true;
        let usernameAvailable = true;

        const userWithEmail = await User.findOne({ email: req.params.email });
        if (userWithEmail) { 
            emailAvailable = false;
        }

        const userWithUsername = await User.findOne({ username: req.params.username });
        if (userWithUsername) {
            
            usernameAvailable = false;
        }

        return res.json({ available: (emailAvailable && usernameAvailable), emailAvailable: emailAvailable, usernameAvailable: usernameAvailable });
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// POST - User sign up - create a new generic user (No coaching profile)
router.post("/user", async (req, res) => {
    let newUser = {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        preferredName: req.body.preferredName,
        phoneNumber: req.body.phoneNumber,
        dateOfBirth: req.body.dateOfBirth,
        permissionLevel: req.body.permissionLevel,
        premiumTier: req.body.premiumTier,
        createdAt: Date.now(),
        dateLastUpdated: Date.now()
        };

    if (
        !newUser.username ||
        !newUser.email ||
        !newUser.firstName ||
        !newUser.lastName ||
        !newUser.permissionLevel ||
        !newUser.createdAt
    ) {
        return res.status(400).json({ msg: "User is missing one or more required field(s)", errorCode: 1 }); // 1 - Missing one or more field.
    }

    // Permission level - Must be integer between 0 and 3
    newUser.permissionLevel = Math.floor(newUser.permissionLevel);
    if (newUser.permissionLevel > 3) {
        newUser.permissionLevel = 3;
    }
    else if (newUser.permissionLevel < 0) {
        newUser.permissionLevel = 0;
    }

    try {
        const dbUser = new User(newUser);
        await dbUser.save();
        return res.json(dbUser);
    } catch (e) {
        let errorCode = 4; //  4 - Unexpected errors
        if (e.code == "11000") { // Duplicate key error 
            if (e.keyPattern.email) {
                errorCode = 2; // 2 - email already taken
            }
            else if (e.keyPattern.username) {
                errorCode = 3; // 3 - username already taken
            }
        }

        return res.status(400).json({ msg: "Failed to create user: " + e.message, errorCode: errorCode });
    }
});

// GET - returns a list of users with specific params
router.get("/user", async (req, res) => {
    try {
        let users = [];

        let basicMode = requestingTrueFalseParam(req.query, "basicMode");
        if (basicMode == true) {
            // Only show important information
            const rawUsers = await User.find(parseRequestParams(req.query, User), {email:1,username:1,premiumExpiryDate:1,permissionLevel:1,coachingProfiles:1,premiumTier:1});

            rawUsers.forEach((user) => {
                // Create a new tailored user to only return desired information.
                const desiredAttrs = ['_id', 'email', 'username', 'permissionLevel', 'premiumExpiryDate'];

                let tailoredUser = {};
                desiredAttrs.forEach((key) => {
                    tailoredUser[key] = user[key];
                });

                // Determine if user is premium.
                let isPremium = true;
                if (!user.premiumExpiryDate || user.premiumExpiryDate <= Date.now()) {
                    isPremium = false;
                }

                tailoredUser.isPremium = isPremium;

                if (isPremium) { // If is premium, also show the tier that they are premium
                    tailoredUser.premiumTier = user["premiumTier"];
                }

                // Add this tailored user to a list of all tailored users for return.
                users.push(tailoredUser);
            });
        } else {
            let moreDetails = requestingTrueFalseParam(req.query, "moreDetails");
            if (moreDetails == true) {
                let rawUsers = await User.find(parseRequestParams(req.query, User)).populate(
                    [
                        {
                            path: "coachingProfiles"
                        },
                        {
                            path: "simulatorEnrollments",
                            select: "simulator balance",
                            populate: {
                                path: "simulator",
                                select: "-simulatorEnrollments"
                            }
                        }
                    ]
                );
                
                // Additional information for each user
                rawUsers.forEach(async (user) => {
                    // Determine if user is premium
                    let isPremium = true;
                    if (!user.premiumExpiryDate || user.premiumExpiryDate <= Date.now()) {
                        isPremium = false;
                    }

                    // Determing if the user has a coaching profile.
                    let coachingProfileStatus;
                    user.coachingProfiles.forEach((profile) => {
                        switch(profile.status) {
                            case 0:
                                coachingProfileStatus = "Pending";
                                break;
                            case 1:
                                coachingProfileStatus = "Active";
                                break;
                            case 2:
                                coachingProfileStatus = "Hidden";
                                break;
                            default:
                                coachingProfileStatus = "Unavailable";
                                break;
                        }
                        return;
                    });

                    if (user.coachingProfiles.length === 0) {
                        coachingProfileStatus = "None";
                    }

                    const tailoredUser = Object.assign({}, user["_doc"]); // Make copy of the input
                    
                    tailoredUser.isPremium = isPremium;
                    tailoredUser.coachingProfile = coachingProfileStatus;

                    users.push(tailoredUser);
                });
            } else {
                users = await User.find(parseRequestParams(req.query, User));
            }
        }

        return autoManageOutput(res, req.query, users, "User");
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
})

// PUT - Edit user (Edit use profile feature) - By ID
router.put("/user/:userID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
    if (!req.params.userID) {
        return res.status(400).json({ msg: "Users ID is missing" });
    }

    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(400).json({ msg: "User with provided ID not found" });
        }

        user["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                user[key] = newAttrs[key]; // Admin access, complete changes
            }
            else {
                if (!['_id', 'email', 'username', 'simulatorEnrollments', 'badges', 'coachingCoachs', 'premiumPaymentHistory', 'coachingProfiles'].includes(key)) {
                    user[key] = newAttrs[key];
                }
            }
        });

        await user.save();
        res.json(user);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit user (Edit use profile feature) - By Email
router.put("/user/email/:email", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
    if (req.params.email === "") {
        return res.status(400).json({ msg: "Users email is missing" });
    }

    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(400).json({ msg: "User with provided email not found" });
        }

        user["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                user[key] = newAttrs[key]; // Admin access, complete changes
            }
            else {
                if (!['_id', 'email', 'username', 'simulatorEnrollments', 'badges', 'coachingCoachs', 'premiumPaymentHistory', 'coachingProfiles'].includes(key)) {
                    user[key] = newAttrs[key];
                }
            }
        });

        await user.save();
        res.json(user);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE user completely (Delete user) - We might want to add a way to cache deleted user in the future to prevent accidental account deletion - by ID
// Note: Might reconsider allowing user to fully delete their profile
router.delete("/user/:userID", async (req, res) => {
    if (!req.params.userID) {
        return res.status(400).json({ msg: "Users ID is missing" });
    }

    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }
        
        await deepDeleteUser(user._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "User deletion failed: " + e.message });
    }
});

// DELETE user completely (Delete user) - We might want to add a way to cache deleted user in the future to prevent accidental account deletion - by Email
// Note: Might reconsider allowing user to fully delete their profile
router.delete("/user/email/:email", async (req, res) => {
    if (req.params.email === "") {
        return res.status(400).json({ msg: "Email is missing" });
    }

    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }
        
        await deepDeleteUser(user._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "User deletion failed: " + e.message });
    }
});

// DELETE ALL Users (IN REVERSIBLE - DEBUG ONLY!!!!) - Shallow (Kinda)
router.delete("/user", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allUsers = await User.find({});
    
            allUsers.forEach(async (user) => {
                await deepDeleteUser(user._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allUsers.length });
          } catch (e) {
            return res.status(400).json({ msg: "User deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region Special User Commands - Modifies multiple classes and does not fit into any single category */

// POST - Special PUT user operation that affects multiple classes
// Updates user premium status and also adds new payment history.
router.post("/user/:userID", async (req, res) => {
    let newAttrs = req.body;

    if (
        !newAttrs.premiumTier ||
        !newAttrs.premiumExpiryDate
    ) {
        return res.status(400).json({ msg: "Input is missing one or more required field(s)" });
    }

    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(400).json({ msg: "User with provided ID not found" });
        }

        let dbPaymentHistory;
        if (newAttrs.payment) {
            let newPaymentHistory = {
                referenceNumber: newAttrs.payment.referenceNumber,
                paymentMethod: newAttrs.payment.paymentMethod,
                paymentReason: newAttrs.payment.paymentReason,
                payerID: user._id,
                transferAmount: newAttrs.payment.transferAmount,
                transactionDate: newAttrs.payment.transactionDate,
            };
    
            dbPaymentHistory = new PaymentHistory(newPaymentHistory);
    
            await dbPaymentHistory.save();
            
            user.premiumPaymentHistory.push(dbPaymentHistory);
        }

        user.premiumExpiryDate = newAttrs.premiumExpiryDate;
        user.premiumTier = newAttrs.premiumTier;

        await user.save();

        return res.json({user: user, newPaymentHistory: dbPaymentHistory});
    } catch (e) {
      return res.status(400).json({ msg: "Failed to update user premium: " + e.message });
    }
});

/* #endregion */



/* #region Badge */

// POST - New Badge
router.post("/badge", async (req, res) => {
    let newBadge = {
        displayName: req.body.displayName,
        type: req.body.type,
        rarity: req.body.rarity,
        description: req.body.description,
        image: req.body.image,
        enabled: req.body.enabled
    };

    if (
        !newBadge.displayName ||
        !newBadge.type ||
        !newBadge.description
    ) {
        return res.status(400).json({ msg: "Badge is missing one or more required field(s)" });
    }

    try {
        const dbBadge = new Badge(newBadge);
        await dbBadge.save();
        return res.json(dbBadge);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create Badge: " + e.message });
    }
});

// GET - returns a list of badges with specific params
router.get("/badge", async (req, res) => {
    try {
        let badges = await Badge.find(parseRequestParams(req.query, Badge));
        
        return autoManageOutput(res, req.query, badges, "Badge");
        } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
})

// PUT - Badge - By ID
router.put("/badge/:badgeID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
    if (!req.params.badgeID) {
        return res.status(400).json({ msg: "Badge ID is missing" });
    }

    try {
        const badge = await Badge.findById(req.params.badgeID);
        if (!badge) {
            return res.status(400).json({ msg: "Badge with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                badge[key] = newAttrs[key]; // Admin access, complete changes
            }
            else {
                if (!['_id'].includes(key)) {
                    badge[key] = newAttrs[key];
                }
            }
        });

        await badge.save();
        res.json(badge);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE Badge by ID - Deep Delete - Also deletes all associated user Badges
router.delete("/badge/:badgeID", async (req, res) => {
    if (!req.params.badgeID) {
        return res.status(400).json({ msg: "Badge ID is missing" });
    }

    try {
        const badge = await Badge.findById(req.params.badgeID);
        if (!badge) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }
        
        await deepDeleteBadge(badge._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "Badge deletion failed: " + e.message });
    }
});

// DELETE ALL Badges (IN REVERSIBLE - DEBUG ONLY!!!!) - Shallow (Kinda) - Unsure
router.delete("/badge", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allBadges = await Badge.find();
    
            allBadges.forEach(async (badge) => {
                await deepDeleteBadge(badge._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allBadges.length });
          } catch (e) {
            return res.status(400).json({ msg: "Badges deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region UserBadge */

// POST - New UserBadge
router.post("/userbadge", async (req, res) => {
    let newUserBadge = {
      user: req.body.user,
      badgeType: req.body.badgeType,
      acquisition: req.body.acquisition,
      retracted: req.body.retracted,
      displayPosition: req.body.displayPosition,
      dateEarned: Date.now(),
    }
    
    if (req.body.dateEarned) { // Set to date now but default but can be overriten.
        newUserBadge.dateEarned = req.body.dateEarned;
    }

    if (
        !newUserBadge.user ||
        !newUserBadge.badgeType
    ) {
        return res.status(400).json({ msg: "UserBadge is missing one or more required field(s)" });
    }

    try {
        const badge = await Badge.findById(newUserBadge.badgeType);
        if (!badge) {
            return res.status(400).json({ msg: "Badge of the ID of input Badge Type do not exist" });
        }

        const user = await User.findById(newUserBadge.user);
        if (!user) {
            return res.status(400).json({ msg: "User of the input ID do not exist" });
        }

        const dbUserBadge = new UserBadge(newUserBadge);
        await dbUserBadge.save();
        
        try {
            // Save user with change
            user.badges.push(dbUserBadge);
            await user.save();
        } catch (e) {
            return res.status(400).json({ msg: "Failed to save newly created profile to user." + e.message });
        }

        return res.json(dbUserBadge);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create UserBadge: " + e.message });
    }
});

// GET - returns a list of UserBadge with specific params
router.get("/userbadge", async (req, res) => {
    try {
        let userBadge;
        if (requestingTrueFalseParam(req.query, "moreDetails") == true) {
            userBadge = await UserBadge.find(parseRequestParams(req.query, UserBadge)).populate("badgeType");
        }
        else {
            userBadge = await UserBadge.find(parseRequestParams(req.query, UserBadge));
        }

        return autoManageOutput(res, req.query, userBadge, "UserBadge");
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
})

// PUT - UserBadge - By ID
router.put("/userbadge/:userbadgeID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
    if (!req.params.userbadgeID) {
        return res.status(400).json({ msg: "UserBadge ID is missing" });
    }

    try {
        const userBadge = await UserBadge.findById(req.params.userbadgeID);
        if (!userBadge) {
            return res.status(400).json({ msg: "UserBadge with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                userBadge[key] = newAttrs[key]; // Admin access, complete changes
            }
            else {
                if (!['_id'].includes(key)) {
                    userBadge[key] = newAttrs[key];
                }
            }
        });

        await userBadge.save();
        res.json(userBadge);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE UserBadge by ID - Deep Delete - Also deletes all associated user Badges
router.delete("/userbadge/:userbadgeID", async (req, res) => {
    if (!req.params.userbadgeID) {
        return res.status(400).json({ msg: "UserBadge ID is missing" });
    }

    try {
        const userBadge = await UserBadge.findById(req.params.userbadgeID);
        if (!userBadge) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }
        
        await deepDeleteUserBadge(userBadge._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "UserBadge deletion failed: " + e.message });
    }
});

// DELETE ALL UserBadge (IN REVERSIBLE - DEBUG ONLY!!!!) - Shallow (Kinda) - Unsure
router.delete("/userbadge", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allUserBadges = await UserBadge.find();
    
            allUserBadges.forEach(async (userBadge) => {
                await deepDeleteUserBadge(userBadge._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allUserBadges.length });
          } catch (e) {
            return res.status(400).json({ msg: "UserBadge deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region Achievement - Combination of Badge and UserBadge */

// Remove same achievement from any existing user, make badge if it does not exist.
router.post("/achievement", async (req, res) => {
    if (
        !req.body.displayName ||
        !req.body.type ||
        !req.body.description ||
        !req.body.rarity ||
        !req.body.image ||
        !req.body.acquisition ||
        !req.body.dateEarned ||
        !req.body.user
    ) {
        return res.status(400).json({ msg: "Achievement is missing one or more required field(s)" });
    }

    try {
        const user = await User.findById(req.body.user);
        if (!user) {
            return res.status(400).json({ msg: "User of the input ID do not exist" });
        }

        let badge = await Badge.findOne({displayName: req.body.displayName});
        if (badge) { // If Badge Exists - Remove UserBadge from any user that possesses it.
            let userBadges = await UserBadge.find({badgeType: badge._id});
            for (const userBadge of userBadges) {
                if (userBadge.user.equals(user._id)) {
                    await UserBadge.findByIdAndRemove(userBadge._id);

                    const index = user.badges.indexOf(userBadge._id);
                    if (index > -1) { // only splice array when item is found
                        user.badges.splice(index, 1); // 2nd parameter means remove one item only
                    }
                } else { // Another ID
                    await deepDeleteUserBadge(userBadge._id);
                }
            }
        }
        else { // If Badge doesnt exist, create said Badge.
            let newBadge = {
                displayName: req.body.displayName,
                type: req.body.type,
                rarity: req.body.rarity,
                description: req.body.description,
                image: req.body.image,
                enabled: true
            };

            const badge = new Badge(newBadge);
            await badge.save();
        }

        // At this point badge exists, and not assigned to any user badges.
        // We can now make a user badges.
        let newUserBadge = {
            user: user._id,
            badgeType: badge._id,
            acquisition: req.body.acquisition,
            retracted: false,
            displayPosition: 1,
            dateEarned: req.body.dateEarned
        }

        const userBadge = new UserBadge(newUserBadge);
        await userBadge.save();
        
        // Save user with change
        user.badges.push(userBadge);
        await user.save();

        return res.json({badge:badge, userBadge:userBadge, userBadgesList: user.badges});
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});


/* #endregion */



/* #region Coaching Profile itself */

// POST - User sign up - create a new generic user (No coaching profile)
router.post("/coaching", async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    if (
        !req.body.price ||
        !req.body.description ||
        !req.body.requestJustification
    ) {
        return res.status(400).json({ msg: "Coaching profile is missing one or more required field(s)" });
    }

    try {
        const user = await User.findOne({ email: req.body.email }).populate(
        {
            path: "coachingProfiles",
            select: "_id status",
        });

        if (!user) {
            return res.status(400).json({ msg: "The User with provided email not found" });
        }

        // Now with the user, create a coaching profile for said user IF it does not already exist
        let hasActivePendingOrPrivateCoachingProfile = false;
        user.coachingProfiles.forEach((profile) => {
            if (profile.status === 1 || profile.status === 0 || profile.status === 2) {
                hasActivePendingOrPrivateCoachingProfile = true;
                return;
            }
        });

        if (hasActivePendingOrPrivateCoachingProfile) {
            return res.status(400).json({ msg: "This user already has an active, pending, or user hidden associated coaching profile", coachingProfiles: user.coachingProfiles });
        }

        // Start creation coaching profile
        let newCoachingProfile = {
            user: user._id,
            status: req.body.status || 0,
            price: req.body.price,
            description: req.body.description,
            requestJustification: req.body.requestJustification,
            requestResponse: req.body.requestResponse,
            image: req.body.image,
            createdAt: Date.now(),
            dateLastUpdated: Date.now(),
        };

        try {
            // Ensure correct types (Force convert to integer (inside the try catch))
            newCoachingProfile.price = Number(newCoachingProfile.price);
            
            const coachingProfile = new CoachingProfile(newCoachingProfile);

            await coachingProfile.save();

            try {
                // Save user with change
                user.coachingProfiles.push(coachingProfile);
                await user.save();

                return res.json(coachingProfile);
            } catch (e) {
                await User.remove( { _id: coachingProfile._id } );
                return res.status(400).json({ msg: "Failed to save newly created profile to user (Will atempt to delete newly created profile):" + e.message });
            }
        } catch (e) {
          return res.status(400).json({ msg: "Failed to create profile:" + e.message });
        }
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// GET - returns a list of coaching profile with specific params
router.get("/coaching", async (req, res) => {
    try {
        let params = parseRequestParams(req.query, CoachingProfile);

        // Deal with special query
        let emails = requestingSpecificParam(req.query, "email");
        if (emails != null) { // Here we must get a list of simulator enrollments that meets said condition. And add that to the params requirements.
            if (!params["user"]) {
                params["user"] = [];
            }
            
            if (emails != null) {
                const users = await User.find({ email: emails });
                users.forEach((user) => {
                    params["user"].push(user._id);
                });
            }
        }

        let showHideParams = {};
        let moreDetails = requestingTrueFalseParam(req.query, "moreDetails");
        if (moreDetails != true) {
            showHideParams = {user:1,status:1,price:1,description:1,createdAt:1};
        }

        let coachingProfiles;
        let populateUserEmailAndUsername = requestingTrueFalseParam(req.query, "populateUserEmailAndUsername");
        if (populateUserEmailAndUsername == true) {
            coachingProfiles = await CoachingProfile.find(params, showHideParams).populate(
                {
                    path: "user",
                    select: "email username",
                }
            );
        }
        else {
            coachingProfiles = await CoachingProfile.find(params, showHideParams);
        }

        return autoManageOutput(res, req.query, coachingProfiles, "CoachingProfile");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit CoachingProfile - Note: Allowing User to be transfered as well
router.put("/coaching/:coachingProfileID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.coachingProfileID) {
      return res.status(400).json({ msg: "CoachingProfile ID is missing" });
    }
  
    try {
      const coachingProfile = await CoachingProfile.findById(req.params.coachingProfileID);
      if (!coachingProfile) {
        return res.status(400).json({ msg: "CoachingProfile with provided ID not found" });
      }

      coachingProfile["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
      attrKeys.forEach((key) => {
        if (process.env.REACT_APP_DEVELOPMENT == "true") {
            coachingProfile[key] = newAttrs[key]; // Admin access, complete changes
        }
        else {
          if (!['_id', 'reviews', 'coachingClients'].includes(key)) {
            coachingProfile[key] = newAttrs[key];
          }
        }
      });
      await coachingProfile.save();

      res.json(coachingProfile);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// DELETE - coaching profile completely (Delete coaching profile)
// Note: Debug function -  should not be used normally
router.delete("/coaching/:coachingProfileID", async (req, res) => {
    if (!req.params.coachingProfileID) {
        return res.status(400).json({ msg: "Coaching Profile ID is missing" });
    }

    try {
        const coachingProfile = await CoachingProfile.findById(req.params.coachingProfileID);
        if (!coachingProfile) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteCoachingProfile(coachingProfile._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "Coaching profile deletion failed: " + e.message });
    }
});

// DELETE - ALL coaching profile (IN REVERSIBLE - DEBUG ONLY!!!!) (Shallow)
router.delete("/coaching", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allCoachingProfiles = await CoachingProfile.find();
    
            allCoachingProfiles.forEach(async (specificCoachingProfile) => {
                await deepDeleteCoachingProfile(specificCoachingProfile._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allCoachingProfiles.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "Coaching Profile deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region Reviews */

// POST - a new review - Need more work for determining who and when can someone post a review.
router.post("/review", async (req, res) => {
    if (
        !req.body.coachingProfile ||
        !req.body.email ||
        !req.body.rating ||
        !req.body.title ||
        !req.body.details
    ) {
        return res.status(400).json({ msg: "Review is missing one or more required field(s)", review: req.body });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ msg: "User with provided email not found" });
    }

    let coachingProfile = await CoachingProfile.findById(req.body.coachingProfile);
    if (!coachingProfile) {
        return res.status(400).json({ msg: "Coaching profile of the ID not found" });
    }

    let coachID = coachingProfile.user;
    let reviewerID = user._id;

    let newReview = {
        coachingProfile: req.body.coachingProfile,
        coach: coachID,
        user: reviewerID,
        rating: req.body.rating,
        title: req.body.title,
        details: req.body.details,
        spendMoney: req.body.spendMoney,
        requireReview: req.body.requireReview,
        modRemoved: false,
        userEdited: false,

        createdAt: Date.now(),
    };

    try {
        // Ensure correct types (Force convert to integer (inside the try catch))
        newReview.rating = Number(newReview.rating);

        const review = new Review(newReview);
        await review.save();
        
        coachingProfile.reviews.push(review);
        coachingProfile.save();

        return res.json(review);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create new review: " + e.message });
    }
});

// GET - Reviews based on parameters
router.get("/review", async (req, res) => {
    try {
        let reviews;
        let moreDetails = requestingTrueFalseParam(req.query, "moreDetails");
        if (moreDetails == true) {
            reviews = await Review.find(parseRequestParams(req.query, Review)).populate(
                [
                    {
                        path: "coach",
                        select: "email username",
                    },
                    {
                        path: "user",
                        select: "email username",
                    },
                ]
            );
        }
        else {
            reviews = await Review.find(parseRequestParams(req.query, Review));
        }

        return autoManageOutput(res, req.query, reviews, "Reviews");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - EDIT Review
router.put("/review/:reviewID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.reviewID) {
      return res.status(400).json({ msg: "Review ID is missing" });
    }
  
    try {
        const review = await Review.findById(req.params.reviewID);
        if (!review) {
            return res.status(400).json({ msg: "Review with provided ID not found" });
        }

        if (newAttrs["userEdited"]) { // For this special edit, date last edited only apply for the User.
            review["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
        }
      
        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                review[key] = newAttrs[key]; // Admin access, complete changes
            }
            else {
            if (!['_id'].includes(key)) {
                review[key] = newAttrs[key];
            }
            }
        });
        await review.save();

        res.json(review);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - review completely
// Note: Debug function -  should not be used normally
router.delete("/review/:reviewID", async (req, res) => {
    if (!req.params.reviewID) {
        return res.status(400).json({ msg: "Review ID is missing" });
    }

    try {
        const review = await Review.findById(req.params.reviewID);
        if (!review) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteReview(review._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
    } catch (e) {
        return res.status(400).json({ msg: "Review deletion failed: " + e.message });
    }
});

// DELETE - ALL review profile (IN REVERSIBLE - DEBUG ONLY!!!!) (Shallow)
router.delete("/review", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allReviews = await Review.find({});
    
            allReviews.forEach(async (specificReview) => {
                await deepDeleteReview(specificReview._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allReviews.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "Review deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region Special Coaching Session commands. - Modifies multiple classes and does not fit into any single category */

/// User applies for a session with a coach, specificially through a coaching profile.
// Enroll an user to a coaching profile (applying for a session). - Basically creates an CoachingSession Object
router.post("/coaching/:coachingProfileID", async (req, res) => {
    if (!req.params.coachingProfileID) {
        return res.status(400).json({ msg: "coachingProfileID is missing" });
    }
    
    if (!req.body.email) {
        return res.status(400).json({ msg: "User Email is missing" });
    }

    // First check if they had any active sessions
    // Then check if the coach already have this user. If not create it, else check if the coach had blocked the user.
    // Create a new pending session for an user and the coach. (Coach at this point have not yet accepted)
    try {
        // First check if they had any active sessions
        const coachingProfile = await CoachingProfile.findById(req.params.coachingProfileID);
        if (!coachingProfile) {
            return res.status(400).json({ msg: "Coaching Profile with provided ID not found" });
        }

        if (coachingProfile.status != 1) {
            return res.status(400).json({ msg: "The requested coaching profile is not active", coachingProfile: coachingProfile });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
          return res.status(400).json({ msg: "User with provided email not found" });
        }

        const coastingProfileID = coachingProfile._id;
        const coachID = coachingProfile.user;
        const userID = user._id;

        // For a coaching session, we need to check if session is ACTIVE, and status of the coaching profile is 1
        const coachingSessions = await CoachingSession.find({ coach: coachID, client: userID, coachingProfile: coastingProfileID }).populate(
            {
                path: "coachingProfile",
                select: "status",
            }
        );
        
        // Finally time to check if there is any active session.
        let hasValidActiveOrPendingCoachingSession = false;
        if (coachingSessions.length != 0) {
            // Means there can potentially be an active coaching session with the coaching profile
            coachingSessions.forEach((coachingSession) => {
                // If coaching session is still active or pending and also the coaching profile is also active
                if ((coachingSession.status === 0 || coachingSession.status === 1) && coachingSession.coachingProfile.status === 1) {
                    hasValidActiveOrPendingCoachingSession = true;
                    return;
                }
            });
        }

        if (hasValidActiveOrPendingCoachingSession) {
            return res.status(400).json({ msg: "This user already have an active or pending coaching session with the coach and the coaching profile." });
        }

        // Current time at the time of the request
        let currentTime = Date.now();

        // For CoachingClient (On Coach's CoachingProfile side)
        let coachingClient = await CoachingClient.findOne({ user: userID, ownerCoachingProfile: coastingProfileID });
        if (!coachingClient) {
            // Create a CoachingClient profile
            try {
                let newCoachingClient = {
                    ownerCoachingProfile: coastingProfileID,
                    user: userID,
                    note: "",
                    // approvedStatus: false,
                    blocked: false,
                    firstInteraction: currentTime,
                    latestSessionInteraction: currentTime,
                };

                const dbCoachingClient = new CoachingClient(newCoachingClient);
                await dbCoachingClient.save();

                coachingProfile.coachingClients.push(dbCoachingClient);
                await coachingProfile.save();

                coachingClient = dbCoachingClient;
            } catch (e) {
                return res.status(400).json({ msg: "Failed to create an CoachingClient (On Coach's CoachingProfile side): " + e.message });
            }
        }

        // Then check if the coach already have this user. If not create it, else check if the coach had blocked the user.
        let isBlocked = coachingClient.blocked;

        if (isBlocked == true) {
            return res.status(400).json({ msg: "Coach has blocked the client. Cannot proceed further." });
        }

        // For CoachingCoach (On Client's side)
        let coachingCoach = await CoachingCoach.findOne({ user: userID, coach: coachID });
        if (!coachingCoach) {
            // Create a CoachingClient profile
            try {
                let newCoachingCoach = {
                    ownerUser: userID,
                    coach: coachID,
                    note: "",
                    firstInteraction: currentTime,
                    latestSessionInteraction: currentTime,
                };

                const dbCoachingCoach = new CoachingCoach(newCoachingCoach);
                await dbCoachingCoach.save();

                user.coachingCoachs.push(dbCoachingCoach);
                await user.save();

                coachingCoach = dbCoachingCoach;
            } catch (e) {
                return res.status(400).json({ msg: "Failed to create an CoachingClient (On Coach's CoachingProfile side): " + e.message });
            }
        }


        // Create a new pending session for an user and the coach. (Coach at this point have not yet accepted)
        let coachingSession;
        try {
            let newCoachingSession = {
                coachingCoach: coachingCoach._id,
                coachingClient: coachingClient._id,
                coachingProfile: coastingProfileID,
                coach: coachID,
                client: userID,
                requestedTime: currentTime,
                status: 0,
                agreedPayment: coachingProfile.price,
                clientRequestNote: req.body.clientRequestNote,
            };

            const dbCoachingSession = new CoachingSession(newCoachingSession);
            await dbCoachingSession.save();

            coachingClient.coachingSessions.push(dbCoachingSession);
            await coachingClient.save();

            coachingCoach.coachingSessions.push(dbCoachingSession);
            await coachingCoach.save();

            coachingSession = dbCoachingSession;
        } catch (e) {
            return res.status(400).json({ msg: "Failed to create an CoachingClient (On Coach's CoachingProfile side): " + e.message });
        }

        res.json({ coachingSession: coachingSession, coachingCoach: coachingCoach, coachingClient: coachingClient });
      } catch (e) {
        return res.status(400).json({ msg: "Entrolling user to simulator failed: " + e.message });
    }
});

// POST - But basically PUT coaching sessions. (Completions, etc) (Handles logic) - Might be transalted into put request - but want to do it seperately as
// We have other effect not just edit CoachingSession.
router.post("/coachingSession/:coachingSessionID", async (req, res) => {
    // Other status:
    // 0 - Pending (Requested), - Initial status
    // 1 - Active,

    // Session completion, possible status:
    // 2 - Session sucessfully completed (Also made payment if agreed price is not 0),
    // 3 - Session Declined by coach and never became active,
    // 4 - Session Cancelled by User before active,
    // 5 - In progress session cancelled by coach.
    // 6 - In progress session cancelled by user.

    if (!req.params.coachingSessionID) {
        return res.status(400).json({ msg: "coachingSessionID is missing" });
    }

    let currentTime = Date.now();

    let newAttrs = req.body;

    try {
        const coachingSession = await CoachingSession.findById(req.params.coachingSessionID);

        if (!coachingSession) {
            return res.status(400).json({ msg: "Coaching Sessions with provided ID not found" });
        }

        if (newAttrs.status === coachingSession.status) {
            return res.status(400).json({ msg: "Cannot switch to the same status." });
        }

        if (coachingSession.status === 0) {
            // Currently pending, only possible switch are to 1 (active), 3 - Session declined by coach, 4 - Session Request withdrawn by user
            if (newAttrs.status === 1) {
                coachingSession.autoTerminationTime = newAttrs.autoTerminationTime;
                coachingSession.startTime = currentTime;
            } else if (newAttrs.status === 3 || newAttrs.status === 4) {
                if (newAttrs.status === 3) {
                    coachingSession.sessionTerminationReason = "Session Request Declined by the coach.";
                } else {
                    coachingSession.sessionTerminationReason = "Session Request Withdrawn by the user.";
                }

                if (newAttrs.sessionTerminationReason) { // Overritten session termination reason.
                    coachingSession.sessionTerminationReason = newAttrs.sessionTerminationReason;
                }

                coachingSession.endTime = currentTime;
            } else {
                return res.status(400).json({ msg: "Attempting to switch from pending request to an invalid status." });
            }
        }
        else if (coachingSession.status === 1) { 
            // Currently active, only possible switch are to 
            // 2 - completed, 5 - In progress session cancelled by coach,
            // 6 - In progress session cancelled by user. (Might need to be reviewed to ensure non-malicious cancelling)
            if (newAttrs.status === 2) {
                if (newAttrs.payment) { // If user included an payment, we can make the payment history and also add it to this completed coaching session.

                    let newPaymentHistory = {
                        referenceNumber: newAttrs.payment.referenceNumber,
                        paymentMethod: newAttrs.payment.paymentMethod,
                        paymentReason: newAttrs.payment.paymentReason,
                        payeeID: coachingSession.coach,
                        payerID: coachingSession.client,
                        transferAmount: newAttrs.payment.transferAmount,
                        transactionDate: newAttrs.payment.transactionDate,
                    };
        
                    const dbPaymentHistory = new PaymentHistory(newPaymentHistory);

                    await dbPaymentHistory.save();

                    coachingSession.paymentHistory = dbPaymentHistory;

                    coachingSession.sessionTerminationReason = "Session Completed, and payment history recorded.";
                }

                coachingSession.sessionTerminationReason = "Session Completed, but no payment history recorded.";
            } else if (newAttrs.status === 5) {
                coachingSession.sessionTerminationReason = "This Session was in-progress but terminated by the coach.";
            } else if (newAttrs.status === 6) {
                coachingSession.sessionTerminationReason = "This Session was in-progress but terminated by the user.";
            } else {
                return res.status(400).json({ msg: "Attempting to switch from active request to an invalid status." });
            }

            if (newAttrs.sessionTerminationReason) { // Overritten session termination reason.
                coachingSession.sessionTerminationReason = newAttrs.sessionTerminationReason;
            }
            
            coachingSession.endTime = currentTime;
        } else {
            return res.status(400).json({ msg: "The coaching profile is not currently active or pending, status switch not valid." });
        }

        coachingSession.status = newAttrs.status;

        await coachingSession.save();
        
        // Update coaching client and coaching user to inform the latest client interaction - Do it if it exist, doesnt matter if it doesn't
        // (It should always exist unless something went wrong with system) For CoachingClient (On Coach's CoachingProfile side)
        let coachingClient = await CoachingClient.findById(coachingSession.coachingClient);
        if (coachingClient) {
            // Create a CoachingClient profile
            try {
                coachingClient.latestSessionInteraction = currentTime;
                await coachingClient.save();
            } catch {
            }
        }

        // For CoachingCoach (On Client's side)
        let coachingCoach = await CoachingCoach.findById(coachingSession.coachingCoach);
        if (coachingCoach) {
            try {
                coachingCoach.latestSessionInteraction = currentTime;
                await coachingCoach.save();
            } catch {
            }
        }

        res.json(coachingSession);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

/* #endregion */



/* #region Coaching Session */

// GET - coaching sessions based on parameters
router.get("/coachingSession", async (req, res) => {
    try {
        let coachingSessions;
        if (requestingTrueFalseParam(req.query, "minorPopulateCoachAndUser") == true) {
            coachingSessions = await CoachingSession.find(parseRequestParams(req.query, CoachingSession)).populate([{
                path: "coach",
                select: "_id email username"
            },
            {
                path: "client",
                select: "_id email username"
            }
        ]);
        }
        else {
            coachingSessions = await CoachingSession.find(parseRequestParams(req.query, CoachingSession));
        }
        
        return autoManageOutput(res, req.query, coachingSessions, "CoachingSession");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - coaching sessions.
router.put("/coachingSession/:entryID", async (req, res) => {
    const entryID = req.params.entryID;
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);

    if (!entryID) {
        return res.status(400).json({ msg: "ID of Coaching Sessions is missing" });
    }

    try {
        const dbEntry = await CoachingSession.findById(entryID);

        if (!dbEntry) {
            return res.status(400).json({ msg: "Coaching Sessions with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (!['_id', 'paymentHistory', 'chatMessages'].includes(key)) {
                dbEntry[key] = newAttrs[key];
            }
        });

        await dbEntry.save();
        res.json(dbEntry);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - coaching sessions completely (Delete coaching profile)
router.delete("/coachingSession/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "coachingSession ID is missing" });
    }

    try {
        const entry = await CoachingSession.findById(req.params.entryID);
        if (!entry) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteCoachingSession(entry._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "coachingSession deletion failed: " + e.message });
    }
});

// DELETE ALL CoachingSession (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/coachingSession", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let coachingSessions = await CoachingSession.find();
    
            coachingSessions.forEach(async (coachingSession) => {
                await deepDeleteCoachingSession(coachingSession._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: coachingSessions.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "CoachingSession deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region Coaching Clients */

// Coaching Clients
// GET - Coaching Clients based on parameters
router.get("/CoachingClient", async (req, res) => {
    try {
        let coachingClients = await CoachingClient.find(parseRequestParams(req.query, CoachingClient));

        return autoManageOutput(res, req.query, coachingClients, "CoachingClient");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Coaching Clients.
router.put("/CoachingClient/:entryID", async (req, res) => {
    const entryID = req.params.entryID;
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);

    if (!entryID) {
        return res.status(400).json({ msg: "ID of Coaching Clients is missing" });
    }

    try {
        const dbEntry = await CoachingClient.findById(entryID);

        if (!dbEntry) {
            return res.status(400).json({ msg: "Coaching Clients with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (!['_id', 'coachingSessions'].includes(key)) {
                dbEntry[key] = newAttrs[key];
            }
        });

        await dbEntry.save();
        res.json(dbEntry);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - Coaching Clients (Shallow)
router.delete("/CoachingClient/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Coaching Client ID is missing" });
    }

    try {
        const statusMessage = await CoachingClient.deleteOne({_id: req.params.entryID });
        return res.json(statusMessage);
      } catch (e) {
        return res.status(400).json({ msg: "Coaching Client deletion failed: " + e.message });
    }
});

// DELETE ALL Coaching Clients (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/CoachingClient", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let message = await CoachingClient.deleteMany();
     
            return res.json({ msg: "ALL CoachingClient successfully deleted (Shallow)", reciept: message });
      
          } catch (e) {
            return res.status(400).json({ msg: "CoachingClient deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region Coaching Coaches */

// Coaching Coaches
// GET - Coaching Coaches based on parameters
router.get("/CoachingCoach", async (req, res) => {
    try {
        let coachingCoachs = await CoachingCoach.find(parseRequestParams(req.query, CoachingCoach));

        return autoManageOutput(res, req.query, coachingCoachs, "CoachingCoach");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Coaching Coaches.
router.put("/CoachingCoach/:entryID", async (req, res) => {
    const entryID = req.params.entryID;
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);

    if (!entryID) {
        return res.status(400).json({ msg: "ID of Coaching Coache is missing" });
    }

    try {
        const dbEntry = await CoachingCoach.findById(entryID);

        if (!dbEntry) {
            return res.status(400).json({ msg: "Coaching Coache with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (!['_id', 'coachingSessions'].includes(key)) {
                dbEntry[key] = newAttrs[key];
            }
        });

        await dbEntry.save();
        res.json(dbEntry);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - Coaching Coaches (Shallow)
router.delete("/CoachingCoach/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Coaching Coache ID is missing" });
    }

    try {
        const statusMessage = await CoachingCoach.deleteOne({_id: req.params.entryID });
        return res.json(statusMessage);
      } catch (e) {
        return res.status(400).json({ msg: "Coaching Coache deletion failed: " + e.message });
    }
});

// DELETE ALL Coaching Coaches (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/CoachingCoach", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let statusMessage = await CoachingCoach.deleteMany();
            return res.json(statusMessage);
        } catch (e) {
            return res.status(400).json({ msg: "CoachingCoachs deletions failed: " + e.message });
        }
      } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
      }
});

/* #endregion */



/* #region Chat Message */

// Chat Message
// POST - Post a new chat message 
router.post("/ChatMessage", async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    if (!req.body.coachingSession) {
        return res.status(400).json({ msg: "CoachingSession ID is missing" });
    }

    if (
        !req.body.message
    ) {
        return res.status(400).json({ msg: "Chat Message is missing one or more required field(s)" });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ msg: "The User with provided email not found" });
        }

        const coachingSession = await CoachingSession.findById(req.body.coachingSession);
        if (!coachingSession) {
            return res.status(400).json({ msg: "The desired coachingSession not found" });
        }

        let userID = user._id;
        let coachingSessionID =  coachingSession._id;
        
        if (!userID.equals(coachingSession.coach) && !userID.equals(coachingSession.client)) {
            return res.status(400).json({ msg: "The user with the email are neither the client nor coach of the coaching session!" });
        }

        // Start New Chat Message
        let newChatMessage = {
            coachingSession: coachingSessionID,
            user: userID,
            message: req.body.message,
            timeSend: Date.now(),
        };

        try {
            const chatMessage = new ChatMessage(newChatMessage);

            await chatMessage.save();

            try {
                // Save coaching Session with the change
                coachingSession.chatMessages.push(chatMessage);
                await coachingSession.save();

                return res.json(chatMessage);
            } catch (e) {
                return res.status(400).json({ msg: "Failed to save chat message into coaching session." + e.message });
            }
        } catch (e) {
          return res.status(400).json({ msg: "Failed to create chat message:" + e.message });
        }
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// GET - Chat Message based on parameters - In descending order (Newest first)
router.get("/ChatMessage", async (req, res) => {
    try {
        let chatMessages = await ChatMessage.find(parseRequestParams(req.query, ChatMessage)).sort({timeSend:-1});

        return autoManageOutput(res, req.query, chatMessages, "ChatMessage");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Chat Message.
router.put("/ChatMessage/:entryID", async (req, res) => {
    const entryID = req.params.entryID;
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);

    if (!entryID) {
        return res.status(400).json({ msg: "ID of Chat Message is missing" });
    }

    try {
        const dbEntry = await ChatMessage.findById(entryID);

        if (!dbEntry) {
            return res.status(400).json({ msg: "Chat Message with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (!['_id'].includes(key)) {
                dbEntry[key] = newAttrs[key];
            }
        });

        await dbEntry.save();
        res.json(dbEntry);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - Chat Message (Deep Delete)
router.delete("/ChatMessage/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Chat Message ID is missing" });
    }

    try {
        const entry = await ChatMessage.findById(req.params.entryID);
        if (!entry) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteChatMessage(entry._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "Chat Message deletion failed: " + e.message });
    }
});

// DELETE ALL Chat Message (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/ChatMessage", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let statusMessage = await ChatMessage.deleteMany();
            return res.json(statusMessage);
          } catch (e) {
            return res.status(400).json({ msg: "ChatMessages deletions failed: " + e.message });
        }
      } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
      }
});

/* #endregion */



/* #region Payment History - Also used for premium user purchases. */

// Payment history
// GET - Payment history based on parameters
router.get("/PaymentHistory", async (req, res) => {
    try {
        let paymentHistories = await PaymentHistory.find(parseRequestParams(req.query, PaymentHistory));

        return autoManageOutput(res, req.query, paymentHistories, "PaymentHistory");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Payment history. - We should like
router.put("/PaymentHistory/:entryID", async (req, res) => {
    const entryID = req.params.entryID;
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);

    if (!entryID) {
        return res.status(400).json({ msg: "ID of Payment history is missing" });
    }

    try {
        const dbEntry = await PaymentHistory.findById(entryID);

        if (!dbEntry) {
            return res.status(400).json({ msg: "Payment history with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (!['_id'].includes(key)) {
                dbEntry[key] = newAttrs[key];
            }
        });

        await dbEntry.save();
        res.json(dbEntry);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - Payment History (Shallow) - DEBUG FUNCTION SHOULD NOT BE USED, WE DO NOT WANT TO ERASE RECORDS
router.delete("/PaymentHistory/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Payment History ID is missing" });
    }

    try {
        const entry = await PaymentHistory.findById(req.params.entryID);
        if (!entry) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeletePaymentHistory(entry._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "Payment History deletion failed: " + e.message });
    }
});

// DELETE ALL Payment History (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/PaymentHistory", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let paymentHistories = await PaymentHistory.find();
    
            paymentHistories.forEach(async (paymentHistory) => {
                await deepDeletePaymentHistory(paymentHistory._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: paymentHistories.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "Payment Histories deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */