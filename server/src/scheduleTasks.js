// Express and the routers
const   express  =   require("express"),
        router   =   express.Router(),
        mongoose =   require("mongoose"),
        schedule =   require('node-schedule'),
        axios    =   require('axios');

module.exports  =   router;

// const rule = new schedule.RecurrenceRule();
// rule.second = 10;

// const job = schedule.scheduleJob(rule, function(){
//   console.log('Job 1');
// });

// const rule2 = new schedule.RecurrenceRule();
// rule.second = 5;

// const job2 = schedule.scheduleJob(rule2, function(){
//   console.log('Job 2');
// });


// “At minute 0 past every hour.” - https://crontab.guru/#0_*/1_*_*_*
schedule.scheduleJob('0 */1 * * *', async function(){
  // For leaderboard calculation - also getting data from the real time stock API
  await axios({
    method: 'post',
    url:
      process.env.local_route +
      'admin/leaderboard',
    headers: {},
    data: {},
  });

  // Perform some badge calculation - Give the top badge holder a badge.
  // Like top 3 holders

});

// Scheduling job to run every day at 10 pm
// “At 22:00.” - https://crontab.guru/#0_22_*_*_*
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

/* Does not seem to work
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
*/


// The following regions will all achievement (Including helper functions)

/* #region Achievements - Helper Functions */

// Number 1 on a simulator ending!
async function simulatorEndRankingAwards() {
  // Check if Badge of this type
  
}



/* #endregion */



/* #region Achievements */





/* #endregion */
