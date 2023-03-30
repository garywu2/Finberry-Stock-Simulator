// Express and the routers
const   express  =   require("express"),
        router   =   express.Router(),
        mongoose =   require("mongoose"),
        schedule =   require('node-schedule'),
        axios    =   require('axios');

module.exports  =   router;

// Schedule job at every hour when the clock just turned the hour
schedule.scheduleJob('0 30 * * * *', function(){
  // For leaderboard calculation - also getting data from the real time stock API
  axios({
    method: 'post',
    url:
      process.env.local_route +
      'admin/leaderboard',
    headers: {},
    data: {},
  });
});

// Scheduling job to run every day at 10 pm
schedule.scheduleJob('0 22 * * *', function(){
  // For market mover - also getting data from the market movers API
  axios({
    method: 'post',
    url:
      process.env.local_route +
      'admin/marketmover',
    headers: {},
    data: {},
  });
});



// The following regions will all achievement (Including helper functions)

/* #region Achievements - Helper Functions */

// Number 1 on a simulator ending!
async function simulatorEndRankingAwards() {
  // Check if Badge of this type
  
}



/* #endregion */



/* #region Achievements */





/* #endregion */
