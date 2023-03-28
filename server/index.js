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
require("./src/models/MarketMovers");

// Setup environmental variable
require('dotenv').config();

// Routes
process.env.local_route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/';

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
      Stock           =   require("./src/routes/Stock"),
      cors            =   require("cors");

// import dailyRefresh from "./stock"
const app = express();
app.use(cors());

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Perform and activate schedule tasks.
const scheduleTasks =  require("./src/scheduleTasks");

//Routes
app.use("/account", Accounts);
app.use("/educational", Educational);
app.use("/game", Game);
app.use("/admin", Admin);
app.use("/stock", Stock);

// Launching Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started on ${PORT}`));

module.exports = app;