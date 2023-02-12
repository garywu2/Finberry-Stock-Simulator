// Express and the routers
const   express =   require("express"),
        router  =   express.Router();

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// Relevant schemas
const   User        =   require("../models/user"),
        Simulator   =   require("../models/simulator");



//// Simulator - Itself


// POST - Create a new simulator
router.post("/simulator", async (req, res) => {
    let newSimulator = {
        title: req.body.title,
        description: req.body.description,
        startTime: req.body.startTime,
        stopTime: req.body.stopTime,
        userStartFund: req.body.userStartFund,
        hidden: req.body.hidden,
        dateLastUpdated: Date.now(),
    };

    if (
        !newSimulator.title ||
        !newSimulator.description ||
        !newSimulator.startTime ||
        !newSimulator.stopTime ||
        !newSimulator.userStartFund
    ) {
        return res.status(400).json({ msg: "Simulator is missing one or more required field(s)", simulator: newSimulator });
    }

    try {
        const dbSimulator = new Simulator(newSimulator);
        await dbSimulator.save();
        return res.json(dbSimulator);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create new simulator: " + e.message });
    }
});

// GET all simulators (Only return basic information)
router.get("/simulator", async (req, res) => {
    try {
        // Only show important information
        const simulators = await Simulator.find();

        let tailoredSimulator = [];
        simulators.forEach((simulator) => {
            tailoredSimulator.push({baseInfo:simulator,participatingUsersCount:simulator.participatingUsers.length});
        });

        return res.json(tailoredSimulator);

    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// GET simulator by simulatorID
router.get("/simulator/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    try {
        const simulator = await Simulator.findById(req.params.simulatorID).populate("participatingUsers");
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        // For some reason just adding a new field doesnt seem to reflect in return message
        let tailoredSimulator = {baseInfo:simulator,participatingUsersCount:simulator.participatingUsers.length};

        return res.json(tailoredSimulator);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit simulator by ID
router.put("/simulator/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    try {
        const simulator = await Simulator.findById(req.params.simulatorID);
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }
        
        // Must ensure that some element are the same
        req.body.simulator._id = simulator._id;

        req.body.simulator.dateLastUpdated = Date.now();

        await Simulator.findByIdAndUpdate(simulator._id, req.body.simulator);

        return res.json({ msg: "Simulator Edit successful" });

        /*
        // Gary's Proposed Method - Need to be changed to be appropriate for this route.
        const newAttrs = req.body;
        const attrKeys = Object.keys(newAttrs);

        if (!newAttrs._id) {
        return res.status(400).json({ msg: "Email is missing" });
        }

        try {
        const user = await User.findOne({ email: newAttrs.email });
        attrKeys.forEach((key) => {
        if (key !== "email") {
        user[key] = newAttrs[key];
        }
        });
        await user.save();
        */

      } catch (e) {
        return res.status(400).json({ msg: "Simulator edit failed: " + e.message });
    }
});

// DELETE specific simulator completely (In-reversible)
// Note: Might reconsider allowing full deletion of simulator instead of simply hidding a simulator
router.delete("/simulator/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }

    try {
        const simulator = await Simulator.findById(req.params.simulatorID);
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }
        
        let simulatorRemoved = await Simulator.findByIdAndRemove(simulator._id);

        // Delete all associated links from users to this. TODO
        // userRemoved.coachingProfiles.forEach(async (coachingProfile) => {
        //     let coachingProfileID = coachingProfile.coachingProfile
            
        //     await CoachingProfile.deleteOne( {_id: coachingProfileID});
        // });

        return res.json({ msg: "Simulator successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "Simulator deletion failed: " + e.message });
    }
});


// DELETE ALL SIMULATORS (IN REVERSIBLE - DEBUG ONLY!!!!)
router.delete("/simulator", async (req, res) => {
    try {
        let simulatorsRemoved = await Simulator.deleteMany({});

        // Delete all associated links from users to this. TODO
        // userRemoved.coachingProfiles.forEach(async (coachingProfile) => {
        //     let coachingProfileID = coachingProfile.coachingProfile
            
        //     await CoachingProfile.deleteOne( {_id: coachingProfileID});
        // });

        return res.json({ msg: "ALL Similators successfully deleted", simulatorRemoved: simulatorsRemoved });

      } catch (e) {
        return res.status(400).json({ msg: "Simulator deletions failed: " + e.message });
    }
});


/* WIP - included just for other routes
//// Simulator - User enrolment and interactions - WIP
router.post("/simulator/:simulatorID/:email", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    try {
        const simulator = await Simulator.findById(req.params.simulatorID);
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        const user = await User.findOne({ email: req.params.email });
        if (!user) {
          return res.status(400).json({ msg: "User with provided email not found" });
        }
        
        // TODO

        // 1. Go through profile, search the user profile to see if they are already participating in the simulator. (Optional, also check the participating
        // user from Simulator if it already exist there) - Might need to be done for everything as well







        
        let simulatorRemoved = await Simulator.findByIdAndRemove(simulator._id);

        // Delete all associated links from users to this. TODO
        // userRemoved.coachingProfiles.forEach(async (coachingProfile) => {
        //     let coachingProfileID = coachingProfile.coachingProfile
            
        //     await CoachingProfile.deleteOne( {_id: coachingProfileID});
        // });

        return res.json({ msg: "Simulator successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "Simulator deletion failed: " + e.message });
    }





    let newSimulator = {
        title: req.body.title,
        description: req.body.description,
        startTime: req.body.startTime,
        stopTime: req.body.stopTime,
        userStartFund: req.body.userStartFund,
        hidden: req.body.hidden,
        dateLastUpdated: Date.now(),
    };

    if (
        !newSimulator.title ||
        !newSimulator.description ||
        !newSimulator.startTime ||
        !newSimulator.stopTime ||
        !newSimulator.userStartFund
    ) {
        return res.status(400).json({ msg: "Simulator is missing one or more required field(s)", simulator: newSimulator });
    }

    try {
        const dbSimulator = new Simulator(newSimulator);
        await dbSimulator.save();
        return res.json(dbSimulator);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create new simulator: " + e.message });
    }
});

*/
// // GET all simulators (Only return basic information)
// router.get("/simulator", async (req, res) => {
//     try {
//         // Only show important information
//         const simulators = await Simulator.find();

//         let tailoredSimulator = []
//         simulators.forEach((simulator) => {
//             tailoredSimulator.push({baseInfo:simulator,participatingUsersCount:simulator.participatingUsers.length});
//         });

//         return res.json(tailoredSimulator);

//     } catch (e) {
//       return res.status(400).json({ msg: e.message });
//     }
// });

// // GET simulator by simulatorID
// router.get("/simulator/:simulatorID", async (req, res) => {
//     if (!req.params.simulatorID) {
//         return res.status(400).json({ msg: "simulatorID is missing" });
//     }
//     try {
//         const simulator = await Simulator.findById(req.params.simulatorID).populate("participatingUsers")
//         if (!simulator) {
//             return res.status(400).json({ msg: "Simulator with provided ID not found" });
//         }

//         // For some reason just adding a new field doesnt seem to reflect in return message
//         let tailoredSimulator = {baseInfo:simulator,participatingUsersCount:simulator.participatingUsers.length}

//         return res.json(tailoredSimulator);
//     } catch (e) {
//         return res.status(400).json({ msg: e.message });
//     }
// });

// // PUT - Edit simulator by ID
// router.put("/simulator/:simulatorID", async (req, res) => {
//     if (!req.params.simulatorID) {
//         return res.status(400).json({ msg: "simulatorID is missing" });
//     }
//     try {
//         const simulator = await Simulator.findById(req.params.simulatorID)
//         if (!simulator) {
//             return res.status(400).json({ msg: "Simulator with provided ID not found" });
//         }
        
//         // Must ensure that some element are the same
//         req.body.simulator._id = simulator._id

//         req.body.simulator.dateLastUpdated = Date.now()

//         await Simulator.findByIdAndUpdate(simulator._id, req.body.simulator);

//         return res.json({ msg: "Simulator Edit successful" });
//       } catch (e) {
//         return res.status(400).json({ msg: "Simulator edit failed: " + e.message });
//     }
// });

// // DELETE specific simulator completely (In-reversible)
// // Note: Might reconsider allowing full deletion of simulator instead of simply hidding a simulator
// router.delete("/simulator/:simulatorID", async (req, res) => {
//     if (!req.params.simulatorID) {
//         return res.status(400).json({ msg: "simulatorID is missing" });
//     }

//     try {
//         const simulator = await Simulator.findById(req.params.simulatorID)
//         if (!simulator) {
//             return res.status(400).json({ msg: "Simulator with provided ID not found" });
//         }
        
//         let simulatorRemoved = await Simulator.findByIdAndRemove(simulator._id);

//         // Delete all associated links from users to this. TODO
//         // userRemoved.coachingProfiles.forEach(async (coachingProfile) => {
//         //     let coachingProfileID = coachingProfile.coachingProfile
            
//         //     await CoachingProfile.deleteOne( {_id: coachingProfileID});
//         // });

//         return res.json({ msg: "Simulator successfully deleted" });

//       } catch (e) {
//         return res.status(400).json({ msg: "Simulator deletion failed: " + e.message });
//     }
// });


// // DELETE ALL SIMULATORS (IN REVERSIBLE - DEBUG ONLY!!!!)
// router.delete("/simulator", async (req, res) => {
//     try {
//         let simulatorsRemoved = await Simulator.deleteMany({});

//         // Delete all associated links from users to this. TODO
//         // userRemoved.coachingProfiles.forEach(async (coachingProfile) => {
//         //     let coachingProfileID = coachingProfile.coachingProfile
            
//         //     await CoachingProfile.deleteOne( {_id: coachingProfileID});
//         // });

//         return res.json({ msg: "ALL Similators successfully deleted", simulatorRemoved: simulatorsRemoved });

//       } catch (e) {
//         return res.status(400).json({ msg: "Simulator deletions failed: " + e.message });
//     }
// });
