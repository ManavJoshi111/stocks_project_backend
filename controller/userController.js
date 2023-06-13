const User = require("../models/userSchema");
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../controller/googleAuth');
exports.loginGet = async (req, res) => {
  res.send("Login Page");
};
exports.loginUser = async (req, res) => {
  console.log("in login: ", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all the fields" });
  }
  const user = await User.findOne({ email: email, password: password });
  console.log("user ; ", user);
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.cookie("id", user._id, { maxAge: 604800000, httpOnly: true });
    res.cookie("token", token, { maxAge: 604800000, httpOnly: true });
    res.status(200).json({ message: "Login Successful" });
  }
  else {
    const googleUser = await User.findOne({ email: email });
    console.log("Google user : ", googleUser);
    if (googleUser.googleId) {
      return res.status(400).json({ success: "false", error: "Please Login with Google" });
    }
    else {
      return res.status(400).json({ success: "false", error: "Invalid Credentials" });
    }
  }
};

// Login with google
exports.googleLogin = (req, res) => {
  console.log("In googlelogin 1");
  passport.authenticate('google', {
    scope: ['email', 'profile']
  })(req, res);
}

// Callback for google login
exports.googleLoginCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log("User authenticated:", req.user);
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
      res.cookie("id", req.user._id, { maxAge: 604800000, httpOnly: true });
      res.cookie("token", token, { maxAge: 604800000, httpOnly: true });
      res.redirect('http://localhost:3000/');
    });
  })(req, res, next);
};

//sign up
exports.registerUser = async (req, res) => {
  console.log("Body is : ", req.body);
  const { name, contact, email, password } = req.body;
  console.log("Contact is : ", contact);
  const isMatch = await User.findOne({ email: email });
  if (isMatch) {
    // if the user already exisits but looged in using oAuth, means that he will be having google ID but not the password, so if this is the case than we will send an error saying that you have already registered using google, please use that method only
    if (isMatch.googleId && !isMatch.password) {
      return res.status(400).send({ success: "false", error: "You have already registered using google, please use that method only" });
    }
    else if (isMatch.password) {
      return res.status(400).send({ success: "false", error: "Email Already Exists" });
    }
  } else {
    try {
      const user = await User.create({ name, contact, email, password });
      // await user.save();
      console.log("User is : ", user);

      //generating cookie
      console.log("Value which you want is :", process.env.COOKIE_EXPIRE);
      const token = await user.getJWTToken();
      console.log("Token is :", token);
      res.cookie("token", token, { maxAge: 604800000, httOnly: true });
      res.cookie("id", user._id, { maxAge: 604800000, httOnly: true });
      res.status(200).send({ success: "true", user });
    }
    catch (err) {
      console.log("Error occuered : ", err);
      res.status(400).send({ success: "false", error: err });
    }
  }
};

//Log out
exports.logoutUser = async (req, res) => {
  console.log("In logout");
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.set('Access-Control-Allow-Credentials', 'true');
  if (req.user) {
    console.log("In logout if", req.user);
    req.logout((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ success: "false", message: "Unable to logout user" });
      }
      return res.status(200).send({ success: "true", message: "Successfully Logged Out" });
    });
    return;
  } else {
    res.clearCookie("token", { path: "/" });
    res.clearCookie("id", { path: "/" });
    res.status(200).send({ success: "true", message: "Successfully Logged Out" });
  }
  console.log("At end");
};


// Check if the person is already loggedin or not
exports.isLoggedIn = async (req, res) => {
  // if the user is logged in using google oauth
  console.log("req.user is : ", req.user);
  if (req.user) {
    return res.send({ success: "true", message: "Logged in", user: req.user });
  }
  const id = req.cookies.id;
  const token = req.cookies.token;
  if (!token) {
    res.status(200).send({ success: "false", message: "Not logged in", user: req.user });
  }
  else {
    const user = await User.findById(id);
    res.status(200).send({ success: "true", message: "Logged in", user });
  }
}
