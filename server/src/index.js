const express = require("express");
const mongoose = require("mongoose");
const Accounts = require("./routes/Account");
const Educational = require("./routes/Educational");
const Game = require("./routes/Game");
const Payment = require("./routes/Payment");
const Stock = require("./routes/Stock");
const cors = require("cors");

const app = express();
app.use(cors());

const DB = process.env.DB || "mongodb://localhost/finberry";

mongoose.connect(DB, () => {
  console.log("Database Connected");
});

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/accounts", Accounts);

app.use("/educational", Educational);

app.use("/game", Game);

app.use("/payment", Payment);

app.use("/stock", Stock);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on ${PORT}`));