const express         =   require("express"),
      mongoose        =   require("mongoose"),
      Accounts        =   require("./routes/Account"),
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

const DB = process.env.DB || "mongodb://localhost/finberry";

mongoose.connect(DB, () => {
  console.log("Database Connected");
});

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