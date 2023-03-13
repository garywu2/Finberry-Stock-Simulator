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
        CoachingProfile     =   mongoose.model("coachingprofile"),
        Review              =   mongoose.model("Review"),
        CoachingSession     =   mongoose.model("CoachingSession");


        
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
        if (key !== "_id" && key !== "email" && key !== "createdAt" && key !== "simulatorEnrollments" && key !== "badges" && key !== "coaches" && key !== "premiumPaymentHistory" && key !== "coachingProfiles" && key !== "premiumExpiryDate") {
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

router.post("/coaching/newClient", async (req, res) => {

});

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
        const coachingProfileDisapproved = await CoachingProfile.find({ status: 3 });
        const coachingProfileDeactivated = await CoachingProfile.find({ status: 4 });
        const coachingProfileModOrAdmin = await CoachingProfile.find({ status: 5 });
        const allCoachingProfiles = {...coachingProfileDisapproved, ...coachingProfileDeactivated, ...coachingProfileModOrAdmin };
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
        // console.log(index); // Investigating bug
        // console.log(user.coachingProfiles); // Investigating bug

        // user.markModified("coachingProfiles"); // Didnt seem to do anything. But want to make this work somehow
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
        const review = new Review(newReview);
        await review.save();
        
        coachingProfile.reviews.push(review);
        coachingProfile.save();

        return res.json(review);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create new review: " + e.message });
    }
});


// GET all Reviews
router.get("/review", async (req, res) => {
    try {
        const reviews = await Review.find();
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

// // WIP
// /// User applies for a session with a coach, specificially through a coaching profile.
// // Enroll an user to a coaching profile (applying for a session). - Basically creates an CoachingSession Object
// router.post("/coaching/:coachingProfileID", async (req, res) => {
//     if (!req.params.coachingProfileID) {
//         return res.status(400).json({ msg: "coachingProfileID is missing" });
//     }
    
//     if (!req.body.email) {
//         return res.status(400).json({ msg: "User Email is missing" });
//     }

//     try {
//         const simulator = await Simulator.findById(req.params.simulatorID).populate("simulatorEnrollments");
//         if (!simulator) {
//             return res.status(400).json({ msg: "Simulator with provided ID not found" });
//         }

//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//           return res.status(400).json({ msg: "User with provided email not found" });
//         }

//         // 1. Go through profile, search the user profile to see if they are already participating in the simulator. 
//         // (Optional, also check the participating user from Simulator if it already exist there) - Might need to be done for everything as well
//         // Not implemented optional.
//         // if (false) { // For debug only
//         if (simulator.simulatorEnrollments.some(item => item.user.equals(user._id))) { // Already exists
//             return res.status(400).json({ msg: "User already enrolled in simulator" });
//         } else { // Not exists, so we add it to simulator

//             // Start creation of empty ParticipatingUser
//             let newSimulatorEnrollments = {
//                 user: user._id,
//                 simulator: simulator._id,
//                 balance: simulator.userStartFund,
//                 joinDate: Date.now()
//             };

//             const simulatorEnrollment = new SimulatorEnrollment(newSimulatorEnrollments);
//             await simulatorEnrollment.save();
//             try {
//                 // Save simulator and user with change
//                 simulator.simulatorEnrollments.push(simulatorEnrollment);
//                 await simulator.save();

//                 user.simulatorEnrollments.push(simulatorEnrollment);
//                 await user.save();

//                 return res.json(simulatorEnrollment);
//             } catch (e) {
//                 return res.status(400).json({ msg: "Failed to save newly created simulatorEnrollment user in the simulator:" + e.message });
//             }
//         }
//       } catch (e) {
//         return res.status(400).json({ msg: "Entrolling user to simulator failed: " + e.message });
//     }
// });