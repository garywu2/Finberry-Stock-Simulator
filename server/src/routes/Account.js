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
        PaymentHistory      =   mongoose.model("PaymentHistory"),
        Badge               =   mongoose.model("Badge"),
        UserBadge           =   mongoose.model("UserBadge"),
        WatchlistEntry      =   mongoose.model("WatchlistEntry");

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


    // Delete all attached UserBadges
    userRemoved.badges.forEach(async (userBadgeID) => {
        await deepDeleteUserBadge(userBadgeID);
    });

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

// Payment History
async function deepDeletePaymentHistory(toBeRemovedEntryID) {
    await PaymentHistory.findByIdAndRemove(toBeRemovedEntryID);

}

/* #endregion */



/* #region Normal User */

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

// POST - User sign up - create a new generic user
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
            const rawUsers = await User.find(parseRequestParams(req.query, User), {email:1,username:1,premiumExpiryDate:1,permissionLevel:1,premiumTier:1});

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

                    const tailoredUser = Object.assign({}, user["_doc"]); // Make copy of the input
                    
                    tailoredUser.isPremium = isPremium;

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
                if (!['_id', 'email', 'username', 'simulatorEnrollments', 'badges', 'premiumPaymentHistory'].includes(key)) {
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
                if (!['_id', 'email', 'username', 'simulatorEnrollments', 'badges', 'premiumPaymentHistory'].includes(key)) {
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



/* #region Watchlist */

// Resolve a user by email or id — clients know the email, not the id.
async function resolveWatchlistUser(source) {
    if (source.user) {
        return source.user;
    }
    if (source.email) {
        const user = await User.findOne({ email: source.email }, { _id: 1 });
        return user ? user._id : null;
    }
    return null;
}

// GET - a user's watched symbols
router.get("/watchlist", async (req, res) => {
    try {
        const userId = await resolveWatchlistUser(req.query);
        if (!userId) {
            return res.status(400).json({ msg: "A user id or email is required." });
        }

        const entries = await WatchlistEntry.find({ user: userId }).sort({ addedAt: -1 });
        return res.json(entries);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// POST - watch a symbol (idempotent)
router.post("/watchlist", async (req, res) => {
    try {
        const userId = await resolveWatchlistUser(req.body);
        if (!userId) {
            return res.status(400).json({ msg: "A user id or email is required." });
        }
        if (!req.body.symbol) {
            return res.status(400).json({ msg: "A symbol is required." });
        }

        const symbol = String(req.body.symbol).toUpperCase().trim();
        const entry = await WatchlistEntry.findOneAndUpdate(
            { user: userId, symbol: symbol },
            { $setOnInsert: { user: userId, symbol: symbol, index: req.body.index || "N/A", addedAt: Date.now() } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.json(entry);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE - stop watching a symbol
router.delete("/watchlist/:symbol", async (req, res) => {
    try {
        const userId = await resolveWatchlistUser(req.query);
        if (!userId) {
            return res.status(400).json({ msg: "A user id or email is required." });
        }
        if (!req.params.symbol) {
            return res.status(400).json({ msg: "A symbol is required." });
        }

        const statusMessage = await WatchlistEntry.deleteOne({
            user: userId,
            symbol: String(req.params.symbol).toUpperCase().trim(),
        });
        return res.json(statusMessage);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
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