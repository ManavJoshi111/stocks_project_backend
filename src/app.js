const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const session = require("express-session");
const app = express();
const passport = require('passport');
app.use(session({ secret: "thisismysecretkey" }));
app.use(passport.initialize());
app.use(passport.session());
dotenv.config({ path: "./config/config.env" });
app.use(cors({ credentials: true, origin: process.env.HOST }));
app.use(cookieParser());
const PORT = process.env.PORT;
app.use(express.json());


//to check whether server running or not

app.get("/", (req, res) => {

    res.status(200).json({ msg: "server is up...!" })

});

//Route imports
const user = require('../route/userRoute');
app.use("", user);

const trades = require('../route/tradesRoute');
app.use('', trades);

app.listen(process.env.PORT, () => {
    console.log(`Server is started on port ${PORT}`);
});
