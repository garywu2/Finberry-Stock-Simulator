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

/* #endregion */


/* #region Special API calls */

// Wait for sequencial geting of price data.
async function getPricedStockInformation(stockDictionary) {
    return new Promise(async (resolve) => {
        console.log("Price dictionary requested.");

        for (const index of Object.keys(stockDictionary)) {
            for (const symbol of Object.keys(stockDictionary[index])) {
                let currentSymbol = symbol;
                let currentIndex = index;
                
                /* - Might want to preserve this - not sure, so leave here for now. - Might want to use seperate API key for leaderboard calculation.
                // Query price information - Through 12 data. But we instead want to only use or own API keys.
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
                    console.log("Credits left for the minute: " + creditsLeft);

                    if (priceResults["price"]) {
                        latestStockPrice = Number(priceResults["price"]);
                    }
                    
                    stockDictionary[index][symbol] = latestStockPrice; // Set the found prices
                });
                */

                // Query price information - Through our own API - We might add caching to it later.
                await axios({
                    method: 'get',
                    url: process.env.local_route +
                    'stock/price',
                    params: {
                        symbol: currentSymbol,
                        exchange: currentIndex,
                    },
                }).then((result) => {
                    let latestStockPrice = result.data.price; 
                    stockDictionary[index][symbol] = latestStockPrice; // Set the found prices
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