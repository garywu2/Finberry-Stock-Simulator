const express         =   require("express"),
      mongoose        =   require("mongoose");

require("./models/CoachingProfile");
require("./models/user");
require("./models/Article");
require("./models/user");
require("./models/simulator");
require("./models/simulatorEnrollment");
require("./models/holding");
require("./models/tradeTransaction");

const DB = process.env.DB || "mongodb://localhost/finberry";
mongoose.connect(DB, () => {
  console.log("Database Connected");
});
          
const Accounts        =   require("./routes/Account"),
      // User            =   require("./routes/Account/user"),
      // CoachingProfile =   require("./routes/Account/coachingProfile"),
      Educational     =   require("./routes/Educational"),
      Game            =   require("./routes/Game"),
      Payment         =   require("./routes/Payment"),
      Stock           =   require("./routes/Stock"),
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on ${PORT}`));