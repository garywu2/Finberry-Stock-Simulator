const express         =   require("express"),
      mongoose        =   require("mongoose");

// Loading all the mongoose schematics routes.
require("./src/models/User");
require("./src/models/Badge");
require("./src/models/UserBadge");
require("./src/models/Article");
require("./src/models/Simulator");
require("./src/models/SimulatorEnrollment");
require("./src/models/Holding");
require("./src/models/TradeTransaction");
require("./src/models/Review");
require("./src/models/CoachingSession");
require("./src/models/PaymentHistory");
require("./src/models/ChatMessage");
require("./src/models/CoachingCoach");
require("./src/models/CoachingClient");
require("./src/models/CoachingProfile");

// Setup environmental variable
require('dotenv').config();

if (process.env.REACT_APP_DEVELOPMENT == "true") {
  console.log("Developement mode is Enabled.");
}

const DB = process.env.REACT_APP_DB || "mongodb://localhost/finberry";
mongoose.connect(DB, () => {
  console.log("Database Connected");
});
          
const Accounts        =   require("./src/routes/Account"),
      Educational     =   require("./src/routes/Educational"),
      Game            =   require("./src/routes/Game"),
      Admin           =   require("./src/routes/Admin"),
      cors            =   require("cors");

// import dailyRefresh from "./stock"
const app = express();
app.use(cors());

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Daily update functions - This is for calculating leaderboards, values, etc
// TODO: Call this daily
// dailyRefresh();

//Routes
app.use("/account", Accounts);
app.use("/educational", Educational);
app.use("/game", Game);
app.use("/admin", Admin);

// Launching Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started on ${PORT}`));

module.exports = app;