const User = require("../models/userSchema");
const jwt = require('jsonwebtoken');

exports.loginGet = async (req, res) => {
  res.send("Login Page");
};
exports.loginUser = async (req, res) => {
  console.log(req.body.email, " and ", req.body.password);
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
      .send({ success: "true", message: "successfully logged in", user });
  } else {
    res
      .status(400)
      .send({ success: "false", message: "Incorrect User Email or Password" });
  }
};

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

  res.clearCookie("token", { path: "/" });
  res.clearCookie("id", { path: "/" });
  res.status(200).send({ success: "true", message: "Successfully Logged Out" });
};

// Check if the person is already loggedin or not
exports.isLoggedIn = async (req, res) => {
  const id = req.cookies.id;
  const token = req.cookies.token;
  if (!token) {
    res.status(200).send({ success: "false", message: "Not logged in" });
  }
  else {
    const user = await User.findById(id);
    res.status(200).send({ success: "true", message: "Logged in", user });
  }
}
