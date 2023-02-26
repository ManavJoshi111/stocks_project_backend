const User = require("../models/userSchema");
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('../controller/googleAuth');
exports.loginGet = async (req, res) => {
  res.send("Login Page");
};
exports.loginUser = async (req, res) => {
  console.log(req.body.email, " and ", req.body.password);
  console.log(req.body);
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ success: "false", message: "Please fill all the fields" });
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email: email }).select("+password");
  if (user) {
    const token = user.getJWTToken();
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    console.log("Generated token : ", token);
    res.cookie("id", user._id, options);
    res
      .status(200)
      .cookie("token", token, options)
      .send({ success: "true", message: "Successfully logged in", user });
  } else {
    res
      .status(400)
      .send({ success: "false", message: "Incorrect User Email or Password" });
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
      res.redirect('http://localhost:3000/');
    });
  })(req, res, next);
};


// exports.googleLoginCallback = (req, res, next) => {
//   passport.authenticate('google')(req, res, next);
//   console.log("In googlelogin callback", req.user);
//   res.redirect('http://localhost:3000/');
// };


// exports.googleLoginCallback = (req, res, next) => {
//   passport.authenticate('google', {
//     failureRedirect: 'http://localhost:3000/login',
//     successRedirect: 'http://localhost:3000/'
//   })(req, res, next);
//   //   ((err, user, info, status) => {
//   //     console.log("In googlelogin callback");
//   //     if (err) { return next(err) }
//   //     if (!user) { return res.redirect('http://localhost:3000/login') }
//   //     res.status(200).send({ success: "true", message: "Successfully logged in", user: user });
//   //   }))(req, res, next);
//   // console.log("In googlelogin callback");
// };

//sign up
exports.registerUser = async (req, res) => {
  console.log("Body is : ", req.body);
  const { name, contact, email, password } = req.body;
  console.log("Contact is : ", contact);
  const isMatch = await User.findOne({ email: email });
  if (isMatch) {
    res.status(400).send({ success: "false", error: "Email Already Exists" });
  } else {
    try {
      const user = await User.create({ name, contact, email, password });
      // await user.save();
      console.log("User is : ", user);

      //generating cookie
      console.log("Value which you want is :", process.env.COOKIE_EXPIRE);
      const token = await user.getJWTToken();
      console.log("Token is :", token);
      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      res.cookie("token", token, options);
      res.cookie("id", user._id, options);
      res.status(200).send({ success: "true", user });
    }
    catch (err) {
      console.log("Error occuered : ", err);
      res.status(400).send({ success: "false", error: err });
      // let error = err.errors;
      // for (let i in error) {
      //   error = error[i];
      //   break;
      // }
      // switch (error.path) {
      //   case "name":
      //     res.status(400).send({ success: "false", error: error.message });
      //     break;
      //   case "email":
      //     res.status(400).send({ success: "false", error: error.message });
      //     break;
      //   case "password":
      //     res.status(400).send({ success: "false", error: error.message });
      //     break;
      //   case "contact":
      //     res.status(400).send({ success: "false", error: error.message });
      //     break;
      //   default:
      //     res.status(400).send({ success: "false", error: "Something went wrong...\nPlease Try Again After Sometime" });
      // }
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
