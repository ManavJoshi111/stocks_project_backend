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

//Route imports
const user = require('../route/userRoute');
app.use("", user);
dotenv.config({ path: "./config/config.env" });

app.listen(process.env.PORT, () => {
    console.log(`Server is started on port ${PORT}`);
});
