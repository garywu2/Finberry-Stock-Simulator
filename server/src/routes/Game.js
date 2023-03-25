// Express and the routers
const   express  =   require("express"),
        router   =   express.Router(),
        mongoose =   require("mongoose");

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

// Relevant schemas
const   User                    =   mongoose.model("User"),
        Simulator               =   mongoose.model("Simulator"),
        SimulatorEnrollment     =   mongoose.model("SimulatorEnrollment"),
        Holding                 =   mongoose.model("Holding"),
        TradeTransaction        =   mongoose.model("TradeTransaction");

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

// Simulator
async function deepDeleteSimulator(simulator_id) {
    let simulatorRemoved = await Simulator.findByIdAndRemove(simulator_id);

    // Use the deep delete function from simulator to deep delete all its enrollments.
    simulatorRemoved.simulatorEnrollments.forEach(async (simulatorEnrollment) => {
        await deepDeleteSimulatorEnrollment(simulatorEnrollment._id);
    });
}

// SimulatorEnrollment (Basically un-enrolling an user from a simulator) 
async function deepDeleteSimulatorEnrollment(simulatorEnrollment_id) {
    let simulatorEnrollmentRemoved = await SimulatorEnrollment.findByIdAndRemove(simulatorEnrollment_id);

    // Must remove the entry from the user and the simulator as well
    const ownerUserID = simulatorEnrollmentRemoved.user;
    const ownerSimulatorID = simulatorEnrollmentRemoved.simulator;

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

// Holding
async function deepDeleteHolding(toBeRemovedEntryID) {
    let holdingRemoved = await Holding.findByIdAndRemove(toBeRemovedEntryID);

    // Must remove the entry from simulatorEnrollment as well.
    const simulatorEnrollmentID = holdingRemoved.simulatorEnrollment;

    try { // For CoachingClient
        const entry = await SimulatorEnrollment.findById(simulatorEnrollmentID);
        if (!entry) {
            return;
        }
        const index = entry.holdings.indexOf(toBeRemovedEntryID);
        if (index > -1) { // only splice array when item is found
            entry.holdings.splice(index, 1); // 2nd parameter means remove one item only
        }

        await entry.save();
    } catch (e) {
    }
}

// TradeTransaction
async function deepDeleteTradeTransaction(toBeRemovedEntryID) {
    let tradeTransactionRemoved = await TradeTransaction.findByIdAndRemove(toBeRemovedEntryID);

    // Must remove the entry from simulatorEnrollment as well.
    const simulatorEnrollmentID = tradeTransactionRemoved.simulatorEnrollment;

    try { // For CoachingClient
        const entry = await SimulatorEnrollment.findById(simulatorEnrollmentID);
        if (!entry) {
            return;
        }
        const index = entry.tradeHistory.indexOf(toBeRemovedEntryID);
        if (index > -1) { // only splice array when item is found
            entry.tradeHistory.splice(index, 1); // 2nd parameter means remove one item only
        }

        await entry.save();
    } catch (e) {
    }
}

/* #endregion */



/* #region Simulator (Itself) */

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
        // Ensure correct types (Force convert to integer (inside the try catch))
        newSimulator.userStartFund = Number(newSimulator.userStartFund);

        const dbSimulator = new Simulator(newSimulator);
        await dbSimulator.save();
        return res.json(dbSimulator);
    } catch (e) {
      return res.status(400).json({ msg: "Failed to create new simulator: " + e.message });
    }
});

// Tailor returning results - Helper function for GET Simulator
function TailorSimulatorList(simulators, showAllAttrs = false) {
    let tailoredSimulators = [];
    simulators.forEach((simulator) => {
        let tailoredSimulator = {};

        if (showAllAttrs) {
            tailoredSimulator = Object.assign({}, simulator["_doc"]); // Make copy of the input
        } else {
            // Create a new tailored user to only return desired information.
            let desiredAttrs = ['_id', 'title', 'description', 'startTime', 'stopTime', 'userStartFund', 'hidden', 'dateLastUpdated'];

            desiredAttrs.forEach((key) => {
                tailoredSimulator[key] = simulator[key];
            });
        }

        tailoredSimulator.participatingUsersCount = simulator.simulatorEnrollments.length;

        tailoredSimulators.push(tailoredSimulator);
    });

    return tailoredSimulators;
}

// GET simulators
router.get("/simulator", async (req, res) => {
    try {
        let simulators;
        let moreDetails = requestingTrueFalseParam(req.query, "moreDetails");
        if (moreDetails == true) {
            simulators = await Simulator.find(parseRequestParams(req.query, Simulator)).populate("simulatorEnrollments");
        } else {
            simulators = await Simulator.find(parseRequestParams(req.query, Simulator));
        }

        return autoManageOutput(res, req.query, TailorSimulatorList(simulators, moreDetails), "Simulator");
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit simulator by ID
router.put("/simulator/:simulatorID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.simulatorID) {
      return res.status(400).json({ msg: "Simulator id is missing" });
    }
  
    try {
        const simulator = await Simulator.findOne({ _id: req.params.simulatorID });
        if (!simulator) {
            return res.status(400).json({ msg: "Simulator with provided ID not found" });
        }

        simulator["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                simulator[key] = newAttrs[key]; // Admin access, complete changes
            } else {
                if (!['_id', 'simulatorEnrollments'].includes(key)) {
                    simulator[key] = newAttrs[key];
                }
            }
        });
        await simulator.save();
        res.json(simulator);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
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
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteSimulator(simulator._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "Simulator deletion failed: " + e.message });
    }
});

// DELETE ALL SIMULATORS (IN REVERSIBLE - DEBUG ONLY!!!!) - Shallow (Kinda)
router.delete("/simulator", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allSimulators = await Simulator.find({});
    
            allSimulators.forEach(async (specificSimulator) => {
                await deepDeleteSimulator(specificSimulator._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allSimulators.length });
          } catch (e) {
            return res.status(400).json({ msg: "Simulator deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});


/* #endregion */



/* #region SimulatorEnrollment - User enrolment and interactions */

// POST - Enroll an user to a simulator. - Basically creates an SimulatorEnrollment Object
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

// GET - simulatorEnrollment based on params
router.get("/simulatorEnrollment", async (req, res) => {
    try {
        let simulatorEnrollments;
        let moreDetails = requestingTrueFalseParam(req.query, "moreDetails");
        if (moreDetails == true) {
            simulatorEnrollments = await SimulatorEnrollment.find(parseRequestParams(req.query, SimulatorEnrollment)).populate(["holdings", "tradeHistory"]);
        } else {
            simulatorEnrollments = await SimulatorEnrollment.find(parseRequestParams(req.query, SimulatorEnrollment));
        }

        return autoManageOutput(res, req.query, simulatorEnrollments, "simulatorEnrollment");
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit simulator by ID
router.put("/simulatorEnrollment/:simulatorEnrollmentID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.simulatorEnrollmentID) {
      return res.status(400).json({ msg: "simulatorEnrollmentID id is missing" });
    }
  
    try {
        const simulatorEnrollment = await SimulatorEnrollment.findOne({ _id: req.params.simulatorEnrollmentID });
        if (!simulatorEnrollment) {
            return res.status(400).json({ msg: "SimulatorEnrollment with provided ID not found" });
        }

        simulatorEnrollment["dateLastUpdated"] = Date.now(); // Atempt to set the dateLastUpdated, this can be overriten by input.
        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                simulatorEnrollment[key] = newAttrs[key]; // Admin access, complete changes
            } else {
                if (!['_id', 'user', "simulator", "holdings", "tradeHistory"].includes(key)) {
                    simulatorEnrollment[key] = newAttrs[key];
                }
            }
        });
        await simulatorEnrollment.save();
        res.json(simulatorEnrollment);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// DELETE - an SimulatorEnrollment (Basically un-enrolling an user from a simulator) 
// Note: Debug function -  should not be used normally
router.delete("/simulatorEnrollment/:simulatorEnrollmentID", async (req, res) => {
    if (!req.params.simulatorEnrollmentID) {
        return res.status(400).json({ msg: "SimulatorEnrollment ID is missing" });
    }

    try {
        const simulatorEnrollment = await SimulatorEnrollment.findById(req.params.simulatorEnrollmentID);
        if (!simulatorEnrollment) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteSimulatorEnrollment(simulatorEnrollment._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "SimulatorEnrollment deletion failed: " + e.message });
    }
});

// DELETE ALL SimulatorEnrollment - Shallow (Kinda)
router.delete("/simulatorEnrollment", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let allSimulatorEnrollments = await SimulatorEnrollment.find({});
    
            allSimulatorEnrollments.forEach(async (specificSimulatorEnrollment) => {
                await deepDeleteSimulatorEnrollment(specificSimulatorEnrollment._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: allSimulatorEnrollments.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "SimulatorEnrollment deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});


/* #endregion */



/* #region StockExchange Commands - Special commands not necessarily associated with a specific profile */

// GET the specific balance of a user enrolled in a simulator.
router.get("/balance/:simulatorID/:email", async (req, res) => {
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
        const simulatorEnrollment = await SimulatorEnrollment.findOne({ user: userID, simulator: simulatorID }).populate("tradeHistory");
        if (!simulatorEnrollment) {
          return res.status(400).json({ msg: "Cannot find any valid SimulatorEnrollment of this simulator with the provided email." });
        }

        return res.json({"balance": simulatorEnrollment.balance});
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

/// STOCK EXCHANGE (User action on simulator, either buy or sell) - More commands can be added to it in the future.
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
        // Ensure correct types (Force convert to integer (inside the try catch))
        req.body.quantity = Number(req.body.quantity);
        req.body.price = Number(req.body.price);
        req.body.transactionType = Number(req.body.transactionType);

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
        if (newTradeTransaction.transactionType === 1) { // Atempt to buy stocks
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
        else if (newTradeTransaction.transactionType === 2) { // Atempt to sell stocks.
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

/* #endregion */



/* #region Holdings */

// POST for holdings are not directly created, it must be done through the StockExchange Commands when buying stocks.

// GET a list of holdings meeting Params
router.get("/holding", async (req, res) => {
    try {
        let params = parseRequestParams(req.query, Holding);

        // Deal with special query
        let simulatorIDs = requestingSpecificParam(req.query, "simulatorID");
        let emails = requestingSpecificParam(req.query, "email");
        if (simulatorIDs != null || emails != null) { // Here we must get a list of simulator enrollments that meets said condition. And add that to the params requirements.
            let simulatorEnrollmentParams = {};
            if (emails != null) {
                const users = await User.find({ email: emails });
                simulatorEnrollmentParams["user"] = [];
                users.forEach((user) => {
                    simulatorEnrollmentParams["user"].push(user._id);
                });
            }

            if (simulatorIDs != null) {
                simulatorEnrollmentParams["simulator"] = simulatorIDs;
            }

            // Need to search up to find the SimulatorEnrollment with the the params, get a list of all the simulator enrollments desired
            const simulatorEnrollments = await SimulatorEnrollment.find(simulatorEnrollmentParams);
            
            if (!params["simulatorEnrollment"]) {
                params["simulatorEnrollment"] = [];
            }

            simulatorEnrollments.forEach((simulatorEnrollment) => {
                params["simulatorEnrollment"].push(simulatorEnrollment._id);
            });
        }

        if (requestingTrueFalseParam(req.query, "greaterThanZero")) {
            params["quantity"] = {$gt : 0};
        }

        const holdings = await Holding.find(params);

        return autoManageOutput(res, req.query, holdings, "Holding");
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit simulator by ID
router.put("/holding/:holdingID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.holdingID) {
      return res.status(400).json({ msg: "Holding ID is missing" });
    }
  
    try {
        const holding = await Holding.findOne({ _id: req.params.holdingID });
        if (!holding) {
            return res.status(400).json({ msg: "Holding with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                holding[key] = newAttrs[key]; // Admin access, complete changes
            } else {
                if (!['_id', 'simulatorEnrollment'].includes(key)) {
                    holding[key] = newAttrs[key];
                }
            }
        });
        await holding.save();
        res.json(holding);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// DELETE - Holding (Deep Delete)
router.delete("/holding/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "Holding ID is missing" });
    }

    try {
        const entry = await Holding.findById(req.params.entryID);
        if (!entry) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteHolding(entry._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "Holding deletion failed: " + e.message });
    }
});

// DELETE ALL holdings (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/holding", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let holdings = await Holding.find();
    
            holdings.forEach(async (holding) => {
                await deepDeleteHolding(holding._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: holdings.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "Holdings deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});

/* #endregion */



/* #region TradeHistory */

// POST for TradeHistory are not directly created, it must be done through the StockExchange Commands when buying or selling stocks.

// GET a list of TradeTransaction meeting params
router.get("/tradeTransaction", async (req, res) => {
    try {
        let params = parseRequestParams(req.query, TradeTransaction);

        // Deal with special query
        let simulatorIDs = requestingSpecificParam(req.query, "simulatorID");
        let emails = requestingSpecificParam(req.query, "email");
        if (simulatorIDs != null || emails != null) { // Here we must get a list of simulator enrollments that meets said condition. And add that to the params requirements.
            let simulatorEnrollmentParams = {};
            if (emails != null) {
                const users = await User.find({ email: emails });
                simulatorEnrollmentParams["user"] = [];
                users.forEach((user) => {
                    simulatorEnrollmentParams["user"].push(user._id);
                });
            }

            if (simulatorIDs != null) {
                simulatorEnrollmentParams["simulator"] = simulatorIDs;
            }

            // Need to search up to find the SimulatorEnrollment with the the params, get a list of all the simulator enrollments desired
            const simulatorEnrollments = await SimulatorEnrollment.find(simulatorEnrollmentParams);
            
            if (!params["simulatorEnrollment"]) {
                params["simulatorEnrollment"] = [];
            }

            simulatorEnrollments.forEach((simulatorEnrollment) => {
                params["simulatorEnrollment"].push(simulatorEnrollment._id);
            });
        }

        const tradeTransactions = await TradeTransaction.find(params).sort({transactionTime:1});
        
        return autoManageOutput(res, req.query, tradeTransactions, "TradeTransaction");
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// PUT - Edit TradeTransaction by ID
router.put("/tradeTransaction/:tradeTransactionID", async (req, res) => {
    const newAttrs = req.body;
    const attrKeys = Object.keys(newAttrs);
  
    if (!req.params.tradeTransactionID) {
      return res.status(400).json({ msg: "TradeTransaction ID is missing" });
    }
  
    try {
        const tradeTransaction = await TradeTransaction.findOne({ _id: req.params.tradeTransactionID });
        if (!tradeTransaction) {
            return res.status(400).json({ msg: "TradeTransaction with provided ID not found" });
        }

        attrKeys.forEach((key) => {
            if (process.env.REACT_APP_DEVELOPMENT == "true") {
                tradeTransaction[key] = newAttrs[key]; // Admin access, complete changes
            } else {
                if (!['_id', 'simulatorEnrollment'].includes(key)) {
                    tradeTransaction[key] = newAttrs[key];
                }
            }
        });
        await tradeTransaction.save();
        res.json(tradeTransaction);
    } catch (e) {
      return res.status(400).json({ msg: e.message });
    }
});

// DELETE - TradeTransaction (Deep Delete)
router.delete("/tradeTransaction/:entryID", async (req, res) => {
    if (!req.params.entryID) {
        return res.status(400).json({ msg: "TradeTransaction ID is missing" });
    }

    try {
        const entry = await TradeTransaction.findById(req.params.entryID);
        if (!entry) {
            return res.json({ acknowledged: true, deletedCount: 0 });
        }

        await deepDeleteTradeTransaction(entry._id);

        return res.json({ acknowledged: true, deletedCount: 1, deepDelete: true });
      } catch (e) {
        return res.status(400).json({ msg: "TradeTransaction deletion failed: " + e.message });
    }
});

// DELETE ALL TradeTransaction (IN REVERSIBLE - DEBUG ONLY!!!!) (Also shallow delete)
router.delete("/tradeTransaction", async (req, res) => {
    if (process.env.REACT_APP_DEVELOPMENT == "true") { // Development level permission
        try {
            let tradeTransactions = await TradeTransaction.find();
    
            tradeTransactions.forEach(async (holding) => {
                await deepDeleteTradeTransaction(holding._id);
            });
    
            return res.json({ acknowledged: true, deletedCount: tradeTransactions.length });
    
          } catch (e) {
            return res.status(400).json({ msg: "TradeTransaction deletions failed: " + e.message });
        }
    } else {
        return res.status(400).json({ msg: "You do not have permission to use development mode commands."});
    }
});


/* #endregion */



/* #region BalanceCalculation (Leaderboard, current total balance (with stock taken into account), etc) */

// WIP

/* #endregion */