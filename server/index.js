const express         =   require("express"),
      mongoose        =   require("mongoose");

require("./src/models/CoachingProfile");
require("./src/models/User");
require("./src/models/Article");
require("./src/models/Simulator");
require("./src/models/SimulatorEnrollment");
require("./src/models/Holding");
require("./src/models/TradeTransaction");
require("./src/models/Review");
require("./src/models/CoachingSession");

const DB = process.env.DB || "mongodb://localhost/finberry";
mongoose.connect(DB, () => {
  console.log("Database Connected");
});
          
const Accounts        =   require("./src/routes/Account"),
      // User            =   require("./routes/Account/user"),
      // CoachingProfile =   require("./routes/Account/coachingProfile"),
      Educational     =   require("./src/routes/Educational"),
      Game            =   require("./src/routes/Game"),
      Payment         =   require("./src/routes/Payment"),
      Stock           =   require("./src/routes/Stock"),
      cors            =   require("cors");

// import dailyRefresh from "./stock"

const app = express();
app.use(cors());

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Daily update functions
// TODO: Call this daily
// dailyRefresh();

//Routes
app.use("/account", Accounts);

app.use("/educational", Educational);

app.use("/game", Game);

app.use("/payment", Payment);

app.use("/stock", Stock);

const PORT = 5010;
console.log("Good so far");
app.listen(PORT, () => console.log(`server started on ${PORT}`));

module.exports = app;