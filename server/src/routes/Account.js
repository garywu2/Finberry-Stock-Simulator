// Express and the routers
const   express =   require("express"),
        router  =   express.Router();

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// // Relevant schemas
const   User                =   require("../models/user"),
        CoachingProfile     =   require("../models/CoachingProfile");



//// USER and PROFILE (Not coaching)

// POST - User sign up - create a new generic user (No coaching profile)
router.post("/user", async (req, res) => {
    // return res.json({ msg: "User is missing one or more required field(s)" });

    let newUser = {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        preferredName: req.body.preferredName,
        dateOfBirth: req.body.dateOfBirth,
        // dateOfBirth: Date.now(),
        permissionLevel: req.body.permissionLevel,
        // createdAt: req.body.createdAt,
        createdAt: Date.now(),
        profile: -1
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
    newUser.permissionLevel = Math.floor(newUser.permissionLevel)
    if (newUser.permissionLevel > 3) {
        newUser.permissionLevel = 3
    }
    else if (newUser.permissionLevel < 0) {
        newUser.permissionLevel = 0
    }

    // const queryUser = await User.findOne({ email: newUser.email });
    // if (queryUser) {
    //     return res.status(400).json({ msg: "User with this email already exist" });
    // }

    try {
        const dbUser = new User(newUser);
        await dbUser.save();
        return res.json(dbUser);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create user: " + e.message });
    }
});

// GET all Users (Only return basic information)
router.get("/user", async (req, res) => {
    try {
        // Show ALL information for ALL users
        // const users = await User.find();
        // return res.json(users);

        // Only show important information
        const users = await User.find({}, {email:1,username:1,premiumExpiryDate:1,permissionLevel:1,coachingProfiles:1,_id:0});

        let tailoredUsers = []
        users.forEach((user) => {
            // Determine if user is premium
            let isPremium = true
            if (!user.premiumExpiryDate || user.premiumExpiryDate <= Date.now()) {
                isPremium = false
            }

            // Determing if the user has a coaching profile
            let hasActiveCoachingProfile = false 
            let hasPendingCoachingProfile = false 
            user.coachingProfiles.forEach((profile) => {
                if (profile.status == 1) {
                    hasActiveCoachingProfile = true
                    return
                }
                else if (profile.status == 0) {
                    hasPendingCoachingProfile = true
                    return
                }
            });

            // For some reason just adding a new field doesnt seem to reflect in return message
            let tailoredUser
            if (hasActiveCoachingProfile) {
                tailoredUser = {baseInfo:user,isPremium:isPremium,hasActiveCoachingProfile:hasActiveCoachingProfile}
            } else {
                tailoredUser = {baseInfo:user,isPremium:isPremium,hasActiveCoachingProfile:hasActiveCoachingProfile,hasPendingCoachingProfile:hasPendingCoachingProfile}
            }


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
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(400).json({ msg: "User not provided email not found" });
        }

        // Determine if user is premium
        let isPremium = true
        if (!user.premiumExpiryDate || user.premiumExpiryDate <= Date.now()) {
            isPremium = false
        }

        // Determing if the user has a coaching profile
        let hasActiveCoachingProfile = false 
        let hasPendingCoachingProfile = false 
        user.coachingProfiles.forEach((profile) => {
            if (profile.status == 1) {
                hasActiveCoachingProfile = true
                return
            }
            else if (profile.status == 0) {
                hasPendingCoachingProfile = true
                return
            }
        });

        // For some reason just adding a new field doesnt seem to reflect in return message
        let tailoredUser
        if (hasActiveCoachingProfile) {
            tailoredUser = {baseInfo:user,isPremium:isPremium,hasActiveCoachingProfile:hasActiveCoachingProfile}
        } else {
            tailoredUser = {baseInfo:user,isPremium:isPremium,hasActiveCoachingProfile:hasActiveCoachingProfile,hasPendingCoachingProfile:hasPendingCoachingProfile}
        }
        
        return res.json(tailoredUser);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit user (Edit use profile feature) - But ensure email is unchanged.
router.put("/user/:email", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
          return res.status(400).json({ msg: "User with provided email not found" });
        }
        
        // Must ensure that some element are the same (Email must not change)
        req.body.user.email = user.email
        req.body.user.createdAt = user.createdAt
        req.body.user._id = user._id

        req.body.dateLastUpdated = Date.now()

        let editedUser = await User.findByIdAndUpdate(user._id, req.body.user);

        return res.json({ msg: "User Edit successful", editedUser: editedUser });
      } catch (e) {
        return res.status(400).json({ msg: "User edit failed: " + e.message });
    }
});

// DELETE user completely (Delete user) - We might want to add a way to cache deleted user in the future to prevent accidental account deletion
// Note: Might reconsider allowing user to fully delete their profile
router.delete("/user/:email", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    try {
        /* // This works but doesnt delete all the compoenents of it
        let userRemovedMessage = await User.remove( { email: req.params.email } ); 

        if (userRemovedMessage.deletedCount == 0) {
            userRemovedMessage.msg = "User deletion failed"
            return res.status(400).json(userRemovedMessage);
        } else {
            return res.json(userRemovedMessage);
        }
        */

        const user = await User.findOne({ email: req.params.email })
        if (!user) {
            return res.status(400).json({ msg: "The User with provided email not found" });
        }
        
        let userRemoved = await User.findByIdAndRemove(user._id);

        // Delete all associated coaching profiles
        userRemoved.coachingProfiles.forEach(async (coachingProfile) => {
            let coachingProfileID = coachingProfile.coachingProfile
            
            await CoachingProfile.deleteOne( {_id: coachingProfileID});
        });

        // await CoachingProfile.deleteMany( {_id: { $in: userRemovedMessage.coachingProfiles }}); # Need to figure out a wat to use delete many as its way more efficient

        return res.json({ msg: "User successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "User deletion failed: " + e.message });
    }
});



//// Coaches (User - COACHING PROFILE)

// POST - User sign up - create a new generic user (No coaching profile)
router.post("/coaching", async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ msg: "The User with provided email not found" });
        }

        // Now with the user, create a coaching profile for said user IF it does not already exist
        let hasActiveOrPendingCoachingProfile = false 
        user.coachingProfiles.forEach((profile) => {
            if (profile.status == 1 || profile.status == 0) {
                hasActiveOrPendingCoachingProfile = true
                return
            }
        });

        if (hasActiveOrPendingCoachingProfile) {
            return res.status(400).json({ msg: "This user already has an associated coaching profile", user: user });
        }

        

        // Start creation coaching profile
        let newCoachingProfile = {
            userEmail: user.email,
            price: req.body.price,
            description: req.body.description,
            requestJustification: req.body.requestJustification,
            // image: req.body.image,
            createdAt: Date.now()
        };

        

        if (
            !newCoachingProfile.price ||
            !newCoachingProfile.description ||
            !newCoachingProfile.requestJustification
        ) {
            return res.status(400).json({ msg: "Coaching profile is missing one or more required field(s)" });
        }
        
        try {
            console.log(newCoachingProfile)

            const coachingProfile = new CoachingProfile(newCoachingProfile);

            console.log(coachingProfile)

            await coachingProfile.save();

            try {
                // Save user with change
                let combined = {
                    coachingProfile: coachingProfile,
                    status: 0,
                    dateLastUpdated: Date.now()
                }

                user.coachingProfiles.push(combined);
                await user.save()

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

router.get("/coaching", async (req, res) => {
    try {
        const coachingProfile = await CoachingProfile.find();
        return res.json(coachingProfile);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// GET user by email
router.get("/coaching/:email", async (req, res) => {
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }
    try {
        const user = await User.findOne({}, {email:1,username:1,coachingProfiles:1,_id:0}).populate("coachingProfiles.coachingProfile");;
        if (!user) {
            return res.status(400).json({ msg: "User not provided email not found" });
        }

        return res.json(user);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// // PUT - Edit user coaching profile - This can be for admin editing status, 
// router.put("/coaching/:coachingProfileID", async (req, res) => {
//     if (!req.params.email) {
//         return res.status(400).json({ msg: "Email is missing" });
//     }
//     try {
//         const user = await User.findOne({ email: req.params.email });
//         if (!user) {
//           return res.status(400).json({ msg: "User with provided email not found" });
//         }
        
//         // Must ensure that some element are the same (Email must not change)
//         req.body.user.email = user.email
//         req.body.user.createdAt = user.createdAt
//         req.body.user._id = user._id

//         req.body.dateLastUpdated = Date.now()

//         let editedUser = await User.findByIdAndUpdate(user._id, req.body.user);

//         return res.json({ msg: "User Edit successful", editedUser: editedUser });
//       } catch (e) {
//         return res.status(400).json({ msg: "User edit failed: " + e.message });
//     }
// });

// // DELETE user completely (Delete user) - We might want to add a way to cache deleted user in the future to prevent accidental account deletion
// router.delete("/coaching/:email", async (req, res) => {
//     if (!req.params.email) {
//         return res.status(400).json({ msg: "Email is missing" });
//     }

//     try {
//         let userRemovedMessage = await User.remove( { email: req.params.email } );

//         if (userRemovedMessage.deletedCount == 0) {
//             userRemovedMessage.msg = "User deletion failed"
//             return res.status(400).json(userRemovedMessage);
//         } else {
//             return res.json(userRemovedMessage);
//         }
//       } catch (e) {
//         return res.status(400).json({ msg: "User deletion failed: " + e.message });
//     }
// });




