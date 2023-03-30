// Express and the routers
const   express =   require("express"),
        router  =   express.Router(),
        mongoose =  require("mongoose"),
        axios    =   require('axios');

module.exports  =   router;

//for parsing multipart form data (images)
const   multer  =   require("multer"),
        storage =   multer.memoryStorage(),
        upload  =   multer({ storage: storage });

/* #region Helper Functions */

// Super helpful parse param function
// Returns a json file of properly formatted parameters
function parseRequestParams(reqParams, desiredSchemaKeys) {
    let params = {};
    if (Object.keys(reqParams).length != 0) {
        let desiredAttrs = desiredSchemaKeys;
        desiredAttrs.forEach((key) => {
            if (reqParams[key]) {
            params[key] = reqParams[key];
            }
        });
    }

    return params;
}

/* #endregion */


/* #region Stock API calls - Basic */

// Get real time stock prices
router.get('/price', function(req, res) {
    let params = parseRequestParams(req.query, ['symbol', 'exchange', 'timezone'])
    axios({
        method: 'get',
        url: process.env.local_route +
        'stock/exist/' + params.symbol,
        params: {},
    }).then(async (result) => {
        let isAvailable = result.data;

        if (isAvailable) {
            params.apikey = process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY;
            
            axios({
                method: 'get',
                url: 'https://api.twelvedata.com/price',
                params: params,
            }).then((result) => {
                let latestStockPrice = -1;
                let data = result.data; // Those are all the stocks we will need.
                let creditsLeft = Number(result.headers["api-credits-left"]);
                console.log("Realtime Price called - Credits left for the minute: " + creditsLeft);
            
                if (data["price"]) {
                    latestStockPrice = Number(data["price"]);
                }

                res.json({price: latestStockPrice, creditsLeft: creditsLeft, data: data});
            });
        }
        else {
            res.json({price: -1});
        }
    });
});

// Get time series stock price
router.get('/time_series', function(req, res) {
    let params = parseRequestParams(req.query, ['symbol', 'exchange', 'interval', 'outputsize', 'date', 'start_date', 'end_date', 'timezone'])
    params.apikey = process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY;

    axios({
        method: 'get',
        url: 'https://api.twelvedata.com/time_series',
        params: params,
    }).then((result) => {
        let data = result.data; // Those are all the stocks we will need.
        let creditsLeft = Number(result.headers["api-credits-left"]);
        console.log("Time Series called - Credits left for the minute: " + creditsLeft);

        res.json({creditsLeft: creditsLeft, data: data});
    });
});


// We will cache the stock list so we do not have to call it and waste api calls.
global.cachedStockList = [];

// Get List of stocks we desire
router.get('/stocks', async function(req, res) {
    try {
        let stockList = [];
        if (global.cachedStockList.length > 0) {
            stockList = global.cachedStockList;
        }
        else {
            let params1 = {
                exchange: "NASDAQ",
                type: "Common Stock"
            }
        
            let params2 = {
                exchange: "NYSE",
                type: "Common Stock"
            }
        
            params1.apikey = params2.apikey = process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY;

            console.log("Calls made to API for stock list.");

            await axios({
                method: 'get',
                url: 'https://api.twelvedata.com/stocks',
                params: params1,
            }).then((result) => {
                let nasdaqStocks = result.data.data; // Those are all the stocks we will need.

                for (stock of nasdaqStocks) {
                    stockList.push({symbol: stock.symbol, name: stock.name});
                }
            });

            await axios({
                method: 'get',
                url: 'https://api.twelvedata.com/stocks',
                params: params2,
            }).then((result) => {
                let nyseStocks = result.data.data; // Those are all the stocks we will need.

                for (stock of nyseStocks) {
                    stockList.push({symbol: stock.symbol, name: stock.name});
                }
            });

            // Sort the stock list
            stockList.sort((a, b) => {
                return a.symbol.localeCompare(b.symbol);
            });

            global.cachedStockList = stockList;
        }
        
        res.json(stockList);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    };
});

// Verify the a symbol of a stock exist and can be found.
router.get('/exist/:symbol', async function(req, res) {
    try {
        let exist = false;

        await axios({
            method: 'get',
            url: process.env.local_route +
            'stock/stocks',
            params: {},
        }).then((result) => {
            let stockList = result.data;

            if (stockList.some(e => e.symbol === req.params.symbol)) {
                exist = true;
            }
        });

        return res.json(exist);
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    };
});


/* #endregion */



/* #region Stock API calls - Basic */

/* #endregion */



/* #region Special API calls */

// Wait for sequencial geting of price data.
async function getPricedStockInformation(stockDictionary) {
    return new Promise(async (resolve) => {
        console.log("Price dictionary requested.");

        for (const index of Object.keys(stockDictionary)) {
            for (const symbol of Object.keys(stockDictionary[index])) {
                let currentSymbol = symbol;
                // let currentIndex = index;
                
                await axios({
                    method: 'get',
                    url: process.env.local_route +
                    'stock/exist/' + currentSymbol,
                    params: {},
                }).then(async (result) => {
                    let isAvailable = result.data;

                    if (isAvailable) {
                        // Query price information - Through our own API - We might add caching to it later.
                        await axios({
                            method: 'get',
                            url: process.env.local_route +
                            'stock/price',
                            params: {
                                symbol: currentSymbol,
                                // exchange: currentIndex,
                            },
                        }).then((result) => {
                            let latestStockPrice = result.data.price; 
                            stockDictionary[index][symbol] = latestStockPrice; // Set the found prices
                        });
                    }
                    else {
                        stockDictionary[index][symbol] = -1;
                    }
                });
            }
        }

        resolve(stockDictionary);
    })
}

// Get stocks used by only simulator ID - redirect route
router.put('/price_dictionary', async function(req, res) {
    try {
        return res.json(await getPricedStockInformation(req.body));
    } catch (e) {
        return res.status(400).json({ msg: e.message });
    };
});

/* #endregion */