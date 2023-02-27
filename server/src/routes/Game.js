// Express and the routers
const   express =   require("express"),
        router  =   express.Router();

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// Relevant schemas
const   User                    =   require("../models/user"),
        Simulator               =   require("../models/simulator"),
        SimulatorEnrollment     =   require("../models/simulatorEnrollment"),
        Holding                 =   require("../models/holding"),
        TradeTransaction        =   require("../models/tradeTransaction");


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

// Tailor returning results
function TailorSimulatorList(simulators, showAllAttrs = false) {
    let tailoredSimulators = [];
    simulators.forEach((simulator) => {
        let tailoredSimulator = {};

        if (showAllAttrs) {
            tailoredSimulator = Object.assign({}, simulator["_doc"]); // Make copy of the input
        } else {
            // Create a new tailored user to only return desired information.
            let desiredAttrs = ['_id', 'title', 'description', 'userStartFund', 'startTime', 'stopTime', 'hidden', 'dateLastUpdated'];

            desiredAttrs.forEach((key) => {
                tailoredSimulator[key] = simulator[key];
            });
        }

        tailoredSimulator.participatingUsersCount = simulator.simulatorEnrollments.length;

        tailoredSimulators.push(tailoredSimulator);
    });

    return tailoredSimulators;
}

// GET all simulators (Only return basic information)
router.get("/simulator", async (req, res) => {
    try {
        // Only show important information
        const simulators = await Simulator.find();
        return res.json(TailorSimulatorList(simulators));
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});


//get all article
router.get("/simulator/visible", async (req, res) => {
    try {
        const simulators = await Simulator.find({ hidden: true });
        return res.json(TailorSimulatorList(simulators));
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});
  
//get all article
router.get("/simulator/hidden", async (req, res) => {
    try {
        const simulators = await Simulator.find({ hidden: false });
        return res.json(TailorSimulatorList(simulators));
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
        const simulator = await Simulator.findById(req.params.simulatorID).populate("simulatorEnrollments");
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        return res.json(TailorSimulatorList([simulator], true));
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
        req.body.simulator.participatingUsers = simulator.participatingUsers;

        req.body.simulator.dateLastUpdated = Date.now();

        await Simulator.findByIdAndUpdate(simulator._id, req.body.simulator);

        return res.json({ msg: "Simulator Edit successful" });
      } catch (e) {
        return res.status(400).json({ msg: "Simulator edit failed: " + e.message });
    }
});

// Deep delete simulator function
async function deepDeleteSimulator(simulator_id) {
    let simulatorRemoved = await Simulator.findByIdAndRemove(simulator_id);

    // Use the deep delete function from simulator to deep delete all its enrollments.
    simulatorRemoved.simulatorEnrollments.forEach(async (simulatorEnrollment) => {
        await deepDeleteSimulatorEnrollment(simulatorEnrollment._id);
    });
}

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

        await deepDeleteSimulator(simulator._id);

        return res.json({ msg: "Simulator successfully deleted" });
      } catch (e) {
        return res.status(400).json({ msg: "Simulator deletion failed: " + e.message });
    }
});


// DELETE ALL SIMULATORS (IN REVERSIBLE - DEBUG ONLY!!!!)
router.delete("/simulator", async (req, res) => {
    try {
        // let simulatorsRemoved = await Simulator.deleteMany({}); // Another method, but siunce we are deep deleting, this is not needed
        // return res.json({ msg: "ALL Similators successfully deleted", simulatorRemoved: simulatorsRemoved });

        let allSimulators = await Simulator.find({});

        allSimulators.forEach(async (specificSimulator) => {
            await deepDeleteSimulator(specificSimulator._id);
        });

        return res.json({ msg: "ALL Simulators successfully deleted" });
      } catch (e) {
        return res.status(400).json({ msg: "Simulator deletions failed: " + e.message });
    }
});



//// SimulatorEnrollment - User enrolment and interactions

// Enroll an user to a simulator. - Basically creates an SimulatorEnrollment Object
router.post("/simulator/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    
    if (!req.body.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    try {
        const simulator = await Simulator.findById(req.params.simulatorID).populate("simulatorEnrollments");
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
          return res.status(400).json({ msg: "User with provided email not found" });
        }

        // 1. Go through profile, search the user profile to see if they are already participating in the simulator. 
        // (Optional, also check the participating user from Simulator if it already exist there) - Might need to be done for everything as well
        // Not implemented optional.
        // if (false) { // For debug only
        if (simulator.simulatorEnrollments.some(item => item.user.equals(user._id))) { // Already exists
            return res.status(400).json({ msg: "User already enrolled in simulator" });
        } else { // Not exists, so we add it to simulator

            // Start creation of empty ParticipatingUser
            let newSimulatorEnrollments = {
                user: user._id,
                simulator: simulator._id,
                balance: simulator.userStartFund,
                joinDate: Date.now()
            };

            const simulatorEnrollment = new SimulatorEnrollment(newSimulatorEnrollments);
            await simulatorEnrollment.save();
            try {
                // Save simulator and user with change
                simulator.simulatorEnrollments.push(simulatorEnrollment);
                await simulator.save();

                user.simulatorEnrollments.push(simulatorEnrollment);
                await user.save();

                return res.json(simulatorEnrollment);
            } catch (e) {
                return res.status(400).json({ msg: "Failed to save newly created simulatorEnrollment user in the simulator:" + e.message });
            }
        }
      } catch (e) {
        return res.status(400).json({ msg: "Entrolling user to simulator failed: " + e.message });
    }
});


// Deep Delete an SimulatorEnrollment (Basically un-enrolling an user from a simulator) 
async function deepDeleteSimulatorEnrollment(simulatorEnrollment_id) {
    let simulatorEnrollmentRemoved = await SimulatorEnrollment.findByIdAndRemove(simulatorEnrollment_id);

    // Must remove the entry from the user and the simulator as well
    ownerUserID = simulatorEnrollmentRemoved.user;
    ownerSimulatorID = simulatorEnrollmentRemoved.simulator;

    // **** Some issue with this following lines when trying to use the delete all. But works fine for individual deletion. - For both user and Simulator
    try {
        const user = await User.findById(ownerUserID);
        if (user) {
            const index = user.simulatorEnrollments.indexOf(simulatorEnrollment_id);
            if (index > -1) { // only splice array when item is found
                user.simulatorEnrollments.splice(index, 1); // 2nd parameter means remove one item only
            }
            await user.save();
        }
    } catch (e) {
    }
    try {
        const simulator = await Simulator.findById(ownerSimulatorID);
        if (simulator) {
            const index = simulator.simulatorEnrollments.indexOf(simulatorEnrollment_id);
            if (index > -1) { // only splice array when item is found
                simulator.simulatorEnrollments.splice(index, 1); // 2nd parameter means remove one item only
            }
            await simulator.save();
        }
    } catch (e) {
    }
    // Need to remove all holdings + tradeHistory of ths simulator ID
    try {
        await Holding.remove({'simulatorEnrollment':simulatorEnrollment_id});
        await TradeTransaction.remove({'simulatorEnrollment':simulatorEnrollment_id});
    } catch (e) {
    }
}

//get all SimulatorEnrollment
router.get("/simulatorEnrollment", async (req, res) => {
    try {
        const simulatorEnrollments = await SimulatorEnrollment.find({});
        return res.json(simulatorEnrollments);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// DELETE an SimulatorEnrollment (Basically un-enrolling an user from a simulator) 
// Note: Debug function -  should not be used normally
router.delete("/simulatorEnrollment/:simulatorEnrollmentID", async (req, res) => {
    if (!req.params.simulatorEnrollmentID) {
        return res.status(400).json({ msg: "SimulatorEnrollment ID is missing" });
    }

    try {
        const simulatorEnrollment = await SimulatorEnrollment.findById(req.params.simulatorEnrollmentID);
        if (!simulatorEnrollment) {
          return res.status(400).json({ msg: "SimulatorEnrollment of the ID not found" });
        }

        await deepDeleteSimulatorEnrollment(simulatorEnrollment._id);

        return res.json({ msg: "SimulatorEnrollment successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "SimulatorEnrollment deletion failed: " + e.message });
    }
});

// DELETE ALL SimulatorEnrollment
// **** Problem with deep delete when this is done! ****
router.delete("/simulatorEnrollment", async (req, res) => {
    try {
        let allSimulatorEnrollments = await SimulatorEnrollment.find({});

        allSimulatorEnrollments.forEach(async (specificSimulatorEnrollment) => {
            await deepDeleteSimulatorEnrollment(specificSimulatorEnrollment._id);
        });

        return res.json({ msg: "ALL SimulatorEnrollment successfully deleted" });

      } catch (e) {
        return res.status(400).json({ msg: "SimulatorEnrollment deletions failed: " + e.message });
    }
});


/// STOCK EXCHANGE (User action on simulator, either buy or sell)
router.post("/simulator/:simulatorID/:email", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    
    if (!req.params.email) {
        return res.status(400).json({ msg: "Email is missing" });
    }

    // Check if necessary parameters are completed
    if (
        !req.body.symbol ||
        !req.body.index ||
        !req.body.transactionType ||
        !req.body.quantity ||
        !req.body.price ||
        !req.body.transactionTime
    ) {
        return res.status(400).json({ msg: "Missing one or more required field(s)" });
    }

    if (req.body.quantity <= 0) {
        return res.status(400).json({ msg: "Cannot buy or sell zero or negative quantity of stock(s)." });
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

        let simulatorID = simulator._id;
        let userID = user._id;

        // Need to search up to find the SimulatorEnrollment with the simulator and userID
        const simulatorEnrollment = await SimulatorEnrollment.findOne({ user: userID, simulator: simulatorID });
        if (!simulatorEnrollment) {
          return res.status(400).json({ msg: "Cannot find a valid SimulatorEnrollment of the user to the simulator." });
        }

        let simulatorEnrollmentID = simulatorEnrollment._id;

        // Transaction that is about to be created
        let newTradeTransaction = {
            simulatorEnrollment: simulatorEnrollmentID,
            symbol: req.body.symbol,
            index: req.body.index,
            transactionType: req.body.transactionType,
            quantity: req.body.quantity,
            price: req.body.price,
            transactionTime: req.body.transactionTime
        }

        // If atempt to sell stock
        let desiredHolding;
        let tradeTransaction;
        if (newTradeTransaction.transactionType == 1) { // Atempt to buy stocks
            let totalCost = newTradeTransaction.price * newTradeTransaction.quantity; // How much the is needed to complete this transaction

            if (simulatorEnrollment.balance < totalCost) {
                return res.status(400).json({ msg: "Insufficient balance to complete the buy order.", currentBalance: simulatorEnrollment.balance, required: totalCost });
            }
            
            // Modify the new current prices 
            simulatorEnrollment.balance = simulatorEnrollment.balance - totalCost;

            // At this point we have sufficient funds, we can now make this transaction, but first lets check if the user already possesses
            // any holding of this type, if not make a new holding of this type.
            desiredHolding = await Holding.findOne({ simulatorEnrollment: simulatorEnrollmentID, symbol: newTradeTransaction.symbol, index: newTradeTransaction.index });
            if (!desiredHolding) {
                // We create a new holding if not found.
                let newHolding = {
                    simulatorEnrollment: simulatorEnrollmentID,
                    symbol: newTradeTransaction.symbol,
                    index: newTradeTransaction.index,
                    quantity: 0,
                }

                desiredHolding = new Holding(newHolding);

                simulatorEnrollment.holdings.push(desiredHolding);
            }

            // Quantity purchase
            desiredHolding.quantity = desiredHolding.quantity + newTradeTransaction.quantity;

            // Save the holdings
            await desiredHolding.save();

            // Save the trade transaction
            tradeTransaction = new TradeTransaction(newTradeTransaction);
            await tradeTransaction.save();

            // Add the new trade transaction into the list of transactions
            simulatorEnrollment.tradeHistory.push(tradeTransaction);

            // Save the simulatedEnrollemnt
            await simulatorEnrollment.save();
        }
        else if (newTradeTransaction.transactionType == 2) { // Atempt to sell stocks.
            // First we must try to 
            desiredHolding = await Holding.findOne({ simulatorEnrollment: simulatorEnrollmentID, symbol: newTradeTransaction.symbol, index: newTradeTransaction.index });
            if (!desiredHolding) {
                return res.status(400).json({ msg: "Unable to sell desired stock, as the user does not possess this holding at this particular simulator."});
            }

            // Else check if it has sufficient amount of stocks
            if (desiredHolding.quantity < newTradeTransaction.quantity) {
                return res.status(400).json({ msg: "Insufficient number of stocks to sell.", currentStockCount: desiredHolding.quantity, required: newTradeTransaction.quantity });
            }

            // Modify the new current prices 
            let totalSellQuantities = newTradeTransaction.price * newTradeTransaction.quantity; // How much the is gained after this transaction.
            simulatorEnrollment.balance = simulatorEnrollment.balance + totalSellQuantities;

            // Modify the new stock count.
            desiredHolding.quantity = desiredHolding.quantity - newTradeTransaction.quantity;
            
            // Save the holdings
            await desiredHolding.save();

            // Save the trade transaction
            tradeTransaction = new TradeTransaction(newTradeTransaction);
            await tradeTransaction.save();

            // Add the new trade transaction into the list of transactions
            simulatorEnrollment.tradeHistory.push(tradeTransaction);

            // Save the simulatedEnrollemnt
            await simulatorEnrollment.save();
        }  
        else {
            return res.status(400).json({ msg: "Unknown or un-implemented transactionType.", transactionType: newTradeTransaction.transactionType });
        }

        // Transaction complete!
        return res.json({ msg: "Transaction complete!", transactionRequest: req.body, remainingBalance: simulatorEnrollment.balance, desiredHolding: desiredHolding, tradeTransaction: tradeTransaction });

      } catch (e) {
        return res.status(400).json({ msg: "Completing an transaction for an user for a simulator failed: " + e.message });
    }
});

// GET a list of ALL holdings
router.get("/holding", async (req, res) => {
    try {
        // Only show important information
        const holdings = await Holding.find();
        return res.json(holdings);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// GET a list of ALL holdings of a specific simulator
router.get("/holding/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    try {
        const simulator = await Simulator.findById(req.params.simulatorID);
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        let simulatorID = simulator._id;

        // Need to search up to find the SimulatorEnrollment with the simulatorID
        const simulatorEnrollments = await SimulatorEnrollment.find({ simulator: simulatorID }).populate("holdings");
        if (!simulatorEnrollments.length > 0) {
          return res.status(400).json({ msg: "Cannot find any valid SimulatorEnrollment of this simulator." });
        }

        let allHodings = [];
        simulatorEnrollments.forEach((simulatorEnrollment) => {
            allHodings.push(simulatorEnrollment.holdings);
        });

        return res.json(allHodings);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});


// GET a list of ALL holdings of a specific person on a specific simulator
router.get("/holding/:simulatorID/:email", async (req, res) => {
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

        let simulatorID = simulator._id;
        let userID = user._id;

        // Need to search up to find the SimulatorEnrollment with the simulatorID and userID
        const simulatorEnrollments = await SimulatorEnrollment.find({ user: userID, simulator: simulatorID }).populate("holdings");
        if (!simulatorEnrollments.length > 0) {
          return res.status(400).json({ msg: "Cannot find any valid SimulatorEnrollment of this simulator." });
        }

        let allHodings = [];
        simulatorEnrollments.forEach((simulatorEnrollment) => {
            allHodings.push(simulatorEnrollment.holdings);
        });

        return res.json(allHodings);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});


// DELETE ALL holdings (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/holding", async (req, res) => {
    try {
        let message = await Holding.deleteMany();
 
        return res.json({ msg: "ALL Holdings successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "Holdings deletions failed: " + e.message });
    }
  });

// Get a list of ALL trade history (TradeTransactions)
router.get("/tradeHistory", async (req, res) => {
    try {
        // Only show important information
        const tradeTransactions = await TradeTransaction.find();
        return res.json(tradeTransactions);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// GET a list of ALL trade history (TradeTransactions) of a specific simulator
router.get("/tradeHistory/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "simulatorID is missing" });
    }
    try {
        const simulator = await Simulator.findById(req.params.simulatorID);
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        let simulatorID = simulator._id;

        // Need to search up to find the SimulatorEnrollment with the simulatorID
        const simulatorEnrollments = await SimulatorEnrollment.find({ simulator: simulatorID }).populate("tradeHistory");
        if (!simulatorEnrollments.length > 0) {
          return res.status(400).json({ msg: "Cannot find any valid SimulatorEnrollment of this simulator." });
        }

        let allTradeHistory = [];
        simulatorEnrollments.forEach((simulatorEnrollment) => {
            allTradeHistory.push(simulatorEnrollment.tradeHistory);
        });

        return res.json(allTradeHistory);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});


// GET a list of ALL trade history (TradeTransactions) of a specific simulator of a specific person
router.get("/tradeHistory/:simulatorID/:email", async (req, res) => {
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

        let simulatorID = simulator._id;
        let userID = user._id;

        // Need to search up to find the SimulatorEnrollment with the simulatorID and userID
        const simulatorEnrollments = await SimulatorEnrollment.find({ user: userID, simulator: simulatorID }).populate("tradeHistory");
        if (!simulatorEnrollments.length > 0) {
          return res.status(400).json({ msg: "Cannot find any valid SimulatorEnrollment of this simulator." });
        }

        let allTradeHistory = [];
        simulatorEnrollments.forEach((simulatorEnrollment) => {
            allTradeHistory.push(simulatorEnrollment.tradeHistory);
        });

        return res.json(allTradeHistory);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// DELETE ALL trade history (TradeTransactions) (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/tradeHistory", async (req, res) => {
    try {
        let message = await TradeTransaction.deleteMany();
 
        return res.json({ msg: "ALL TradeHistorys successfully deleted (Shallow)", reciept: message });
  
      } catch (e) {
        return res.status(400).json({ msg: "TradeHistorys deletions failed: " + e.message });
    }
});