// Express and the routers
const   express     =   require("express"),
        router      =   express.Router(),
        mongoose    =   require("mongoose"),
        NodeCache   =   require( "node-cache" ),
        axios       =   require('axios');

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

/* #region Dangerous commands */

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
            "marketmovers",
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

/* #endregion */



/* #region Special Events - Market mover, Leaderboard calculations, etc */

// Perform market movers call and data retrieval
async function updateMarketMovers() {
    let outputLog = [];
    await axios
      .get(
        `https://api.twelvedata.com/market_movers/stocks?apikey=${process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY}&outputsize=5`
      )
      .then(async (res) => {
        let creditsLeft = Number(res.headers["api-credits-left"]);
        console.log("Market Mover - Credits left for the minute: " + creditsLeft + ". At: " + new Date().toGMTString());

        await axios({
            method: 'delete',
            url:
            process.env.local_route +
              'game/marketmovers',
            headers: {},
            data: {},
          }).then((result) => {
            for(let i = 0; i < res.data.values.length; i++) {
                outputLog.push(res.data.values[i]);
                axios({
                    method: 'post',
                    url:
                    process.env.local_route +
                      'game/marketmovers',
                    headers: {},
                    data: {
                        symbol: res.data.values[i].symbol,
                        name: res.data.values[i].name,
                        exchange: res.data.values[i].exchange,
                        datetime: res.data.values[i].datetime,
                        last: res.data.values[i].last,
                        high: res.data.values[i].high,
                        low: res.data.values[i].low,
                        volume: res.data.values[i].volume,
                        change: res.data.values[i].change,
                        percent_change: res.data.values[i].percent_change,
                    },
                }).catch((error) => {
                    outputLog.push(error);
                })
            }
          }).catch((error) => {
            outputLog.push(error);
        });
      })
      .catch((error) => {
        outputLog.push(error);
    })

    return outputLog;
}


// Perform Market Mover calculation
router.post("/marketmover", async (req, res) => {
    try {
        // Perform Market Mover update.
        let outputLog = await updateMarketMovers();
        
        // Log at we have performed an attempted update at time.
        console.log("Market Movers Update Attempted.");
        
        return res.json({ msg: "Market Mover Calculation attempted.", outputLog: outputLog });
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// Price cache - 5 minutes
const priceCache = new NodeCache({
    stdTTL: 300
});
// Wait for sequencial geting of price data.
async function getPricedStockInformation(stockDictionary) {
    return new Promise(async (resolve) => {
        for (const index of Object.keys(stockDictionary)) {
            for (const symbol of Object.keys(stockDictionary[index])) {
                let currentSymbol = symbol;
                let currentIndex = index;
                
                let stringParams = JSON.stringify({
                    currentSymbol: symbol,
                    currentIndex: index
                });

                let value = priceCache.get(stringParams);
                if (value == undefined){
                    await axios({
                        method: 'get',
                        url: process.env.local_route +
                        'stock/exist/' + currentSymbol,
                        params: {},
                    }).then(async (result) => {
                        let isAvailable = result.data;
                
                        if (isAvailable) {
                            // Query price information
                            await axios({
                                method: 'get',
                                url: 'https://api.twelvedata.com/price',
                                params: {
                                    apikey: process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY,
                                    symbol: currentSymbol,
                                    exchange: currentIndex,
                                },
                            }).then((result) => {
                                let latestStockPrice = -1; 
                                let priceResults = result.data; // Those are all the stocks we will need.
                                let creditsLeft = Number(result.headers["api-credits-left"]);
                                console.log("Leaderboard Price get - Credits left for the minute: " + creditsLeft + ". At: " + new Date().toGMTString());
    
                                if (priceResults["price"]) {
                                    latestStockPrice = Number(priceResults["price"]);
                                }

                                if (latestStockPrice >= 0) { // Do not cache negative stock prices
                                    priceCache.set(stringParams, latestStockPrice);
                                }
                                stockDictionary[index][symbol] = latestStockPrice; // Set the found prices
                            });
                        }
                        else {
                            // priceCache.set(stringParams, -1); No longer caching if retrieve -1 as it just means retrieval failed.
                            stockDictionary[index][symbol] = -1; // Cannot find price
                        }
                    });
                } else {
                    stockDictionary[index][symbol] = value; // Set the found prices
                }

                
            }
        }

        resolve(stockDictionary);
    });
}

// Perform Leaderboard Calculation
router.post("/leaderboard", async (req, res) => {
    try {
        console.log("Leaderboard Update Started.");

        let resultLog = {};
        await axios({
            method: 'get',
            url:
              process.env.local_route +
              'game/balancecalculation/stocksused',
            headers: {},
            data: {},
        }).then(async (result) => {
            let stockDictionary = await getPricedStockInformation(result.data);
            resultLog["stockDictionaryAquired"] = stockDictionary;

            await axios({
                method: 'post',
                url:
                process.env.local_route +
                    'game/balancecalculation/balance/learderboard',
                headers: {},
                data: {
                    stockInformationTime: Date.now(),
                    stockDictionary: stockDictionary
                },
            }).then(async (result) => {
                resultLog["leaderboardCalculationLog"] = result.data;
            });
        });
        
        // Log at we have performed an attempted update at time.
        console.log("Leaderboard Update Finished. (For all visible leaderboards)");

        return res.json(resultLog);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});

// Perform Leaderboard Calculation
router.post("/leaderboard/:simulatorID", async (req, res) => {
    if (!req.params.simulatorID) {
        return res.status(400).json({ msg: "Simulator ID is missing" });
    }

    try {
        console.log("Leaderboard Update Started. - For simulator ID of: " + req.params.simulatorID);

        let resultLog = {};
        await axios({
            method: 'get',
            url:
              process.env.local_route +
              'game/balancecalculation/stocksused/' + req.params.simulatorID,
            headers: {},
            data: {},
        }).then(async (result) => {
            let stockDictionary = await getPricedStockInformation(result.data);
            resultLog["stockDictionaryAquired"] = stockDictionary;

            await axios({
                method: 'post',
                url:
                process.env.local_route +
                    'game/balancecalculation/balance/learderboard/' + req.params.simulatorID,
                headers: {},
                data: {
                    stockInformationTime: Date.now(),
                    stockDictionary: stockDictionary
                },
            }).then(async (result) => {
                resultLog["leaderboardCalculationLog"] = result.data;
            });
        });
        
        // Log at we have performed an attempted update at time.
        console.log("Leaderboard Update Finished. - For simulator ID of: " + req.params.simulatorID);

        return res.json(resultLog);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    }
});






// // Perform Badge Calculation and assignment - For top members of said leaderboard
// router.post("/badge/top", async (req, res) => {
//     try {
//         console.log("Top badge calculation started");

//         await axios({
//             method: 'post',
//             url:
//             process.env.local_route +
//                 'game/balancecalculation/balance/learderboard',
//             headers: {},
//             data: {
//                 stockInformationTime: Date.now(),
//                 stockDictionary: stockDictionary
//             },
//         }).then(async (result) => {
//             resultLog["leaderboardCalculationLog"] = result.data;
//         });

//         // console.log("Leaderboard Update Started.");

//     } catch (e) {
//         return res.status(400).json({ msg: e.message });
//     }
// });

/* #endregion */


/* #region Create mock data */

// Mock Coaches.
router.post("/mock/coach", async (req, res) => {
    let outputLog = [];
    for (const newEntry of req.body) {
        try {
            let userProperty = newEntry.user;
            let coachingProfileProperty = newEntry.coachingProfile;

            await axios({
                method: 'post',
                url:
                process.env.local_route +
                    'account/user',
                headers: {},
                data: userProperty,
            }).then(async (result) => {
                let newUser = result.data;
                coachingProfileProperty.email = newUser.email;

                await axios({
                    method: 'post',
                    url:
                    process.env.local_route +
                        'account/coaching',
                    headers: {},
                    data: coachingProfileProperty,
                }).then(async (result) => {
                    let newCoachingProfile = result.data;
                    newCoachingProfile.user = newUser;
                    outputLog.push(newCoachingProfile);
                }).catch((error) => {
                    outputLog.push("Coaching Profile Creation Failure: " + error.message);
                });
            }).catch((error) => {
                outputLog.push("User Creation Failure: " + error.message);
            });
        } catch (e) {
            outputLog.push("Invalid Input Style");
        }
    }
    
    res.json(outputLog);
});

// Mock Simulators.
router.post("/mock/simulator", async (req, res) => {
    let outputLog = [];
    for (const newEntry of req.body) {
        try {
            let simulator = newEntry.simulator;
            await axios({
                method: 'post',
                url:
                process.env.local_route +
                    'game/simulator',
                headers: {},
                data: simulator,
            }).then(async (result) => {
                let newSimulator = result.data;
                outputLog.push(newSimulator);
            }).catch((error) => {
                outputLog.push("Simulator Creation Failure: " + error.message);
            });
        } catch (e) {
            outputLog.push("Invalid Input Style.");
        }
    }
    
    res.json(outputLog);
});

// Mock Articles.
router.post("/mock/article", async (req, res) => {
    let outputLog = [];
    for (const newEntry of req.body) {
        try {
            let article = newEntry.article;
            await axios({
                method: 'post',
                url:
                process.env.local_route +
                    'educational/article',
                headers: {},
                data: article,
            }).then(async (result) => {
                let newArticle = result.data;
                outputLog.push(newArticle);
            }).catch((error) => {
                outputLog.push("Article Creation Failure: " + error.message);
            });
        } catch (e) {
            outputLog.push("Invalid Input Style.");
        }
    }
    
    res.json(outputLog);
});

/* #endregion */