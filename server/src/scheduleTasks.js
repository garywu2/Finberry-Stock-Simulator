// Express and the routers
const   express  =   require("express"),
        router   =   express.Router(),
        mongoose =   require("mongoose"),
        schedule =   require('node-schedule'),
        axios    =   require('axios');

module.exports  =   router;

// Schedule job every hour 
schedule.scheduleJob('**/1 * * *', function(){
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
