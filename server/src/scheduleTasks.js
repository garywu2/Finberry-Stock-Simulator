// Express and the routers
const   express  =   require("express"),
        router   =   express.Router(),
        mongoose =   require("mongoose"),
        schedule =   require('node-schedule'),
        axios    =   require('axios');

module.exports  =   router;

// “At minute 0 past every hour.” - https://crontab.guru/#0_*/1_*_*_*
schedule.scheduleJob('0 */1 * * *', async function(){
  console.log("Running Scheduled Leaderboard and Top Badge Update At: " + new Date().toGMTString());
  // For leaderboard calculation - also getting data from the real time stock API
  await axios({
    method: 'post',
    url:
      process.env.local_route +
      'admin/leaderboard',
    headers: {},
    data: {},
  }).catch((error) => {
    console.log("Leaderboard update failed.");
  });

  // Perform some badge calculation - Give the top badge holder a badge.
  // Like top 3 holders, and dead last
  await axios({
    method: 'post',
    url:
      process.env.local_route +
      'game/achievement',
    headers: {},
    data: {},
  }).catch((error) => {
    console.log("Total Badge Calulation failed.");
  });

});

// Scheduling job to run every day at 10 pm
// “At 22:00.” - https://crontab.guru/#0_22_*_*_*
schedule.scheduleJob('0 22 * * *', function(){
  console.log("Running Scheduled Market Mover Update At: " + new Date().toGMTString());
  // For market mover - also getting data from the market movers API
  axios({
    method: 'post',
    url:
      process.env.local_route +
      'admin/marketmover',
    headers: {},
    data: {},
  }).catch((error) => {
    console.log("Market Mover update failed.");
  });
});