// Express and the routers
const   express =   require("express"),
        router  =   express.Router(),
        mongoose =  require("mongoose");

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// Here we have admin only or debug commands.
// This includes special delete commands that will now have to be accessed
// through here.

// DELETE ALL Schemas (IN REVERSIBLE - Wipe entire  database!!!!)
router.delete("/schemas", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") {
        try {
            const relevantCollections = [
            "articles",
            "badges",
            "chatmessages",
            "coachingclients",
            "coachingcoaches",
            "coachingprofiles",
            "coachingsessions",
            "holdings",
            "paymenthistories",
            "reviews",
            "simulators",
            "simulatorenrollments",
            "tradetransactions",
            "users",
            "userbadges",
            ];
            
            let collectionList = await mongoose.connection.db.listCollections().toArray();
    
            let deletionStatus = [];
            collectionList.forEach(function(collection) {       
                collection = collection.name;            
                if (relevantCollections.includes(collection)) {
                    try {
                        mongoose.connection.db.dropCollection(collection);
                        deletionStatus.push((collection + " - Success"));
                    } catch {
                        deletionStatus.push((collection + " - Failed"));
                    }
                } else {
                    deletionStatus.push((collection + " - Not Present"));
                }
            });
            
            return res.json({msg: "Schema Deletion Atempt requested.", status: deletionStatus });
    
          } catch (e) {
            return res.status(400).json({ msg: "Collection deletions atempt failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});
