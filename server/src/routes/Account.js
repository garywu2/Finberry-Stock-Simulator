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
        PaymentHistory      =   mongoose.model("PaymentHistory");

// Super helpful parse param function
// Returns a json file of properly formatted parameters
function parseRequestParams(reqParams, desiredSchema) {
    let params = {}
    if (Object.keys(reqParams).length != 0) {
        const desiredAttrs = Object.keys(desiredSchema.schema.paths);
        desiredAttrs.forEach((key) => {
            if (reqParams[key]) {
                let originalValue = reqParams[key]
                let numericalValue = Number(originalValue);
                
                if (numericalValue) {
                    params[key] = numericalValue;
                }
                else {
                    params[key] = originalValue;
                }
            }
        });
    }

    return params;
}

        
//// USER and PROFILE (Not coaching)

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
        createdAt: Date.now(),
        dateLastUpdated: Date.now(),
        profile: -1,
    };

    if (
        !newUser.username ||
        !newUser.email ||
        !newUser.firstName ||
        !newUser.lastName ||
        !newUser.permissionLevel ||
        !newUser.createdAt
    ) {
        return res.status(400).json({ msg: "User is missing one or more required field(s)" });
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
      return res.status(400).json({ msg: "Failed to create user: " + e.message });
    }
});

// Get user by ID (Emergency patch)
router.get("/user/id/:_id", async (req, res) => {
    if (!req.params._id) {
      return res.status(400).json({ msg: "User id is missing" });
    }
    try {
      const user = await User.findById(req.params._id).populate(
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
      
      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }
      res.json(user);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
  });

// GET user by email and username, determines if email or username is already taken beforehand
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

// GET returns all users
router.get("/user", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
})

// GET all Users (Only return basic information)
router.get("/user/basic", async (req, res) => {
    try {
        // Only show important information
        const users = await User.find({}, {email:1,username:1,premiumExpiryDate:1,permissionLevel:1,coachingProfiles:1,_id:0});

        let tailoredUsers = [];
        users.forEach((user) => {
            // Create a new tailored user to only return desired information.
            const desiredAttrs = ['email', 'username', 'permissionLevel', 'premiumExpiryDate'];

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

            // Add this tailored user to a list of all tailored users for return.
            tailoredUsers.push(tailoredUser);
        });

        return res.json(tailoredUsers);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// GET user by email
router.get("/user/:email", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }
    try {
        const user = await User.findOne({ email: req.params.email }).populate(
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

        if (!user) {
            return res.status(400).json({ msg: "User not provided email not found" });
        }

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

        return res.json(tailoredUser);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit user (Edit use profile feature) - But ensure email is unchanged.
router.put("/user/:email", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
    if (req.params.email === "") {
        return res.status(400).json({ msg: "Users email is missing" });
      }
    try {
        // My original method.
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
          return res.status(400).json({ msg: "User with provided email not found" });
        }
        attrKeys.forEach((key) => {
        if (key !== "_id" && key !== "email" && key !== "createdAt" && key !== "simulatorEnrollments" && key !== "badges" && key !== "coachingCoachs" && key !== "premiumPaymentHistory" && key !== "coachingProfiles" && key !== "premiumExpiryDate") {
            user[key] = newAttrs[key];
        }
        });
          user["dateLastUpdated"] = Date.now();
          await user.save();
          res.json(user);
        } catch (e) {
          return res.status(400).json({ msg: e.message });
        }
      });


// Deep delete user function
async function deepDeleteUser(user_id) {
    let userRemoved = await User.findByIdAndRemove(user_id);

    // Delete all associated coaching profiles
    userRemoved.coachingProfiles.forEach(async (coachingProfileID) => {
        // await CoachingProfile.deleteOne( {_id: coachingProfileID});
        await deepDeleteCoachingProfile(coachingProfileID);
    });

    // Might want to also remove simulator reference such as SimulatorEnrollment but its ok if thats not deleted.
    // Since we might want to keep it in the leaderboard but say deleted user instead. But realistically, we should
    // never delete user.
}


// DELETE user completely (Delete user) - We might want to add a way to cache deleted user in the future to prevent accidental account deletion
// Note: Might reconsider allowing user to fully delete their profile
router.delete("/user/:email", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(400).json({ msg: "The User with provided email not found" });
        }
        
        await deepDeleteUser(user._id);

        return res.json({ msg: "User successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "User deletion failed: " + e.message });
    }
});

// Delete a user based on _id
router.delete("/user", async (req, res) => {
    const id = req.body._id;
    if (!id) {
      return res.status(400).json({ msg: "User id is missing" });
    }
    try {
      await User.deleteOne({ _id: id });
      const users = await User.find();
      res.json(users);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
  });

//// Coaches (User - COACHING PROFILE)
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
        const user = await User.findOne({ email: req.body.email }).populate("coachingProfiles");
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
            status: 0,
            price: req.body.price,
            description: req.body.description,
            requestJustification: req.body.requestJustification,
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

// GET all Coaching profiles with all data
router.get("/coaching", async (req, res) => {
    try {
        const coachingProfile = await CoachingProfile.find();
        return res.json(coachingProfile);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// Get all Pending coaching profiles
router.get("/coaching/pending", async (req, res) => {
    try {
        const coachingProfile = await CoachingProfile.find({ status: 0 }, {_id:1,status:1,user:1,price:1,description:1,requestJustification:1,createdAt:1,dateLastUpdated:1});
        return res.json(coachingProfile);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// Get all Active coaching profiles
router.get("/coaching/active", async (req, res) => {
    try {
        const coachingProfile = await CoachingProfile.find({ status: 1 });
        return res.json(coachingProfile);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// Get all (coach) hidden coaching profiles
router.get("/coaching/hidden", async (req, res) => {
    try {
        const coachingProfile = await CoachingProfile.find({ status: 2 });
        return res.json(coachingProfile);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});


// Get all Terminated coaching profiles
router.get("/coaching/terminated", async (req, res) => {
    try {
        const allCoachingProfiles = await CoachingProfile.find({ status: 3, status: 4, status: 5 });
        return res.json(allCoachingProfiles);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// GET all coaching profile of a coach by email
router.get("/coaching/:email", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }
    try {
        const user = await User.findOne({ email: req.params.email }, {email:1,username:1,coachingProfiles:1,_id:0}).populate("coachingProfiles");
        if (!user) {
            return res.status(400).json({ msg: "User not provided email not found" });
        }

        return res.json(user);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit coach - Ensures ID and coach is unchanged
router.put("/coaching/:coachingProfileID", async (req, res) => {
    if (!req.params.coachingProfileID) {
        return res.status(400).json({ msg: "Coaching Profile ID is missing" });
    }
    try {
        // Ensure correct types (Force convert to integer (inside the try catch))
        // req.body.coachingProfile.price = Number( req.body.coachingProfile.price);
        // req.body.coachingProfile.status = Number( req.body.coachingProfile.status);

        const coachingProfile = await CoachingProfile.findById(req.params.coachingProfileID);
        if (!coachingProfile) {
          return res.status(400).json({ msg: "Coaching profile of the ID not found" });
        }
        
        // Must ensure that some element are the same 
        req.body.coachingProfile.user = coachingProfile.user;
        req.body.coachingProfile.createdAt = coachingProfile.createdAt;
        req.body.coachingProfile._id = coachingProfile._id;

        // These fields should be changed elsewhere and not directly fromt this put request.
        req.body.coachingProfile.reviews = coachingProfile.reviews;
        req.body.coachingProfile.clients = coachingProfile.clients;

        // Auto set
        req.body.coachingProfile.dateLastUpdated = Date.now();

        await CoachingProfile.findByIdAndUpdate(coachingProfile._id, req.body.coachingProfile);

        return res.json({ msg: "Coaching Profile Edit successful" });
      } catch (e) {
        return res.status(400).json({ msg: "Coaching Profile edit failed: " + e.message });
    }
});

// Deep delete coaching profile
async function deepDeleteCoachingProfile(coaching_profile_id) {
    let coachingProfileRemoved = await CoachingProfile.findByIdAndRemove(coaching_profile_id);

    // Must remove the entry from the user as well
    const ownerUserID = coachingProfileRemoved.user;

    // **** Some issue with this following lines when trying to use the delete all. But works fine for individual deletion.
    try {
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


// DELETE coaching profile completely (Delete coaching profile)
// Note: Debug function -  should not be used normally
router.delete("/coaching/:coachingProfileID", async (req, res) => {
    if (!req.params.coachingProfileID) {
        return res.status(400).json({ msg: "Coaching Profile ID is missing" });
    }

    try {
        const coachingProfile = await CoachingProfile.findById(req.params.coachingProfileID);
        if (!coachingProfile) {
          return res.status(400).json({ msg: "Coaching profile of the ID not found" });
        }

        await deepDeleteCoachingProfile(coachingProfile._id);

        return res.json({ msg: "Coaching profile successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "Coaching profile deletion failed: " + e.message });
    }
});

// DELETE ALL coaching profile (IN REVERSIBLE - DEBUG ONLY!!!!)
// **** Problem with deep delete when this is done! ****
router.delete("/coaching", async (req, res) => {
    try {
        let allCoachingProfiles = await CoachingProfile.find({});

        allCoachingProfiles.forEach(async (specificCoachingProfile) => {
            await deepDeleteCoachingProfile(specificCoachingProfile._id);
        });

        return res.json({ msg: "ALL Coaching profile successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "Coaching profile deletions failed: " + e.message });
    }
});



/// Coaching Reviews 
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

// GET Reviews based on parameters
router.get("/review", async (req, res) => {
    try {
        let reviews = await Review.find(parseRequestParams(req.query, Review));

        return res.json(reviews);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// Get all pending (require additional review) Reviews
router.get("/review/pending", async (req, res) => {
    try {
        const reviews = await Review.find({ modRemoved: false, requireReview: true });
        return res.json(reviews);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// Get all visible (active) Reviews
router.get("/review/active", async (req, res) => {
    try {
        const reviews = await Review.find({ modRemoved: false, requireReview: false });
        return res.json(reviews);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// Get all removed Reviews
router.get("/review/terminated", async (req, res) => {
    try {
        const reviews = await Review.find({ modRemoved: true });
        return res.json(reviews);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - EDIT Review
router.put("/review/:reviewID", async (req, res) => {
    if (!req.params.reviewID) {
        return res.status(400).json({ msg: "Review ID is missing" });
    }

    try {
        // // Ensure correct types (Force convert to integer (inside the try catch))
        // req.body.rating = Number(req.body.rating);

        const review = await Review.findById(req.params.reviewID);
        if (!review) {
          return res.status(400).json({ msg: "Review of the ID not found" });
        }
        
        // Must ensure that some element are the same 
        req.body.review.coachingProfile = review.coachingProfile;
        req.body.review.coach = review.coach;
        req.body.review.user = review.user;
        req.body.review.createdAt = review.createdAt;
        req.body.review._id = review._id;

        // Auto set (Only if user edited)
        if (req.body.userEdited) {
            req.body.coachingProfile.dateLastUpdated = Date.now();
        }
        
        await Review.findByIdAndUpdate(review._id, req.body.review);

        return res.json({ msg: "Review Edit successful" });
      } catch (e) {
        return res.status(400).json({ msg: "Review edit failed: " + e.message });
    }
});

// Deep delete review
async function deepDeleteReview(reviewID) {
    let reviewRemoved = await Review.findByIdAndRemove(reviewID);

    let coachingProfileID = reviewRemoved.coachingProfile;

    // **** Some issue with this following lines when trying to use the delete all. But works fine for individual deletion.
    try {
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

// DELETE review completely
// Note: Debug function -  should not be used normally
router.delete("/review/:reviewID", async (req, res) => {
    if (!req.params.reviewID) {
        return res.status(400).json({ msg: "Review ID is missing" });
    }

    try {
        const review = await Review.findById(req.params.reviewID);
        if (!review) {
          return res.status(400).json({ msg: "Review of the ID not found" });
        }

        await deepDeleteReview(review._id);

        return res.json({ msg: "Review successfully deleted" });

    } catch (e) {
        return res.status(400).json({ msg: "Review deletion failed: " + e.message });
    }
});

// DELETE ALL review profile (IN REVERSIBLE - DEBUG ONLY!!!!)
// **** Problem with deep delete when this is done! ****
router.delete("/review", async (req, res) => {
    try {
        let allReviews = await Review.find({});

        allReviews.forEach(async (specificReview) => {
            await deepDeleteReview(specificReview._id);
        });

        return res.json({ msg: "ALL Review successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "Review deletions failed: " + e.message });
    }
});



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

// POST - coaching sessions. (Completions, etc) (Handles logic) - Might be transalted into put request - but want to do it seperately as
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

// GET - coaching sessions based on parameters
router.get("/coachingSession", async (req, res) => {
    try {
        let coachingSessions = await CoachingSession.find(parseRequestParams(req.query, CoachingSession));

        return res.json(coachingSessions);
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

// Deep delete coaching sessions
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

// DELETE - coaching sessions completely (Delete coaching profile)
router.delete("/coachingSession/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "coachingSession ID is missing" });
    }

    try {
        const entry = await CoachingSession.findById(req.params.entryID);
        if (!entry) {
          return res.status(400).json({ msg: "coachingSession with the provided ID not found" });
        }

        await deepDeleteCoachingSession(entry._id);

        return res.json({ msg: "coachingSession successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "coachingSession deletion failed: " + e.message });
    }
});

// DELETE ALL CoachingSession (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/coachingSession", async (req, res) => {
    try {
        let message = await CoachingSession.deleteMany();
 
        return res.json({ msg: "ALL CoachingSessions successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "CoachingSessions deletions failed: " + e.message });
    }
});



// Coaching Clients
// GET - Coaching Clients based on parameters
router.get("/CoachingClient", async (req, res) => {
    try {
        let coachingClients = await CoachingClient.find(parseRequestParams(req.query, CoachingClient));

        return res.json(coachingClients);
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
        const entry = await CoachingClient.findByIdAndDelete(req.params.entryID);

        return res.json(entry);

      } catch (e) {
        return res.status(400).json({ msg: "Coaching Client deletion failed: " + e.message });
    }
});

// DELETE ALL Coaching Clients (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/CoachingClient", async (req, res) => {
    try {
        let message = await CoachingClient.deleteMany();
 
        return res.json({ msg: "ALL CoachingClient successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "CoachingClient deletions failed: " + e.message });
    }
});



// Coaching Coaches
// GET - Coaching Coaches based on parameters
router.get("/CoachingCoach", async (req, res) => {
    try {
        let coachingCoachs = await CoachingCoach.find(parseRequestParams(req.query, CoachingCoach));

        return res.json(coachingCoachs);
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
        const entry = await CoachingCoach.findByIdAndDelete(req.params.entryID);

        return res.json(entry);

      } catch (e) {
        return res.status(400).json({ msg: "Coaching Coache deletion failed: " + e.message });
    }
});

// DELETE ALL Coaching Coaches (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/CoachingCoach", async (req, res) => {
    try {
        let message = await CoachingCoach.deleteMany();
 
        return res.json({ msg: "ALL CoachingCoach successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "CoachingCoachs deletions failed: " + e.message });
    }
});



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


// GET - Chat Message based on parameters
router.get("/ChatMessage", async (req, res) => {
    try {
        let chatMessages = await ChatMessage.find(parseRequestParams(req.query, ChatMessage));

        return res.json(chatMessages);
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



// Deep delete chat Message
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

// DELETE - Chat Message (Deep Delete)
router.delete("/ChatMessage/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Chat Message ID is missing" });
    }

    try {
        const entry = await ChatMessage.findById(req.params.entryID);
        if (!entry) {
          return res.status(400).json({ msg: "Chat Message with the provided ID not found" });
        }

        await deepDeleteChatMessage(entry._id);

        return res.json({ msg: "Chat Message successfully deleted" });
      } catch (e) {
        return res.status(400).json({ msg: "Chat Message deletion failed: " + e.message });
    }
});

// DELETE ALL Chat Message (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/ChatMessage", async (req, res) => {
    try {
        let message = await ChatMessage.deleteMany();
 
        return res.json({ msg: "ALL ChatMessage successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "ChatMessages deletions failed: " + e.message });
    }
});

// Payment history
// GET - Payment history based on parameters
router.get("/PaymentHistory", async (req, res) => {
    try {
        let paymentHistories = await PaymentHistory.find(parseRequestParams(req.query, PaymentHistory));

        return res.json(paymentHistories);
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


// Deep delete Payment History
async function deepDeletePaymentHistory(toBeRemovedEntryID) {
    let chatMessageRemoved = await PaymentHistory.findByIdAndRemove(toBeRemovedEntryID);

    // Maybe we should not be removing the reference from coaching session 
}

// DELETE - Payment History (Shallow) - DEBUG FUNCTION SHOULD NOT BE USED, WE DO NOT WANT TO ERASE RECORDS
router.delete("/PaymentHistory/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Payment History ID is missing" });
    }

    try {
        const entry = await PaymentHistory.findById(req.params.entryID);
        if (!entry) {
          return res.status(400).json({ msg: "Payment History with the provided ID not found" });
        }

        await deepDeletePaymentHistory(entry._id);

        return res.json({ msg: "Payment History successfully deleted" });
      } catch (e) {
        return res.status(400).json({ msg: "Payment History deletion failed: " + e.message });
    }
});

// DELETE ALL Payment History (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/PaymentHistory", async (req, res) => {
    try {
        let message = await PaymentHistory.deleteMany();
 
        return res.json({ msg: "ALL Payment History successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "Payment Histories deletions failed: " + e.message });
    }
});
