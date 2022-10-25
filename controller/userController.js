const User = require("../models/userSchema");

exports.loginUser = async (req, res) => {
  console.log(req.body.email, " and ", req.body.password);
  const { email, password } = req.body;
  
  const user = await User.findOne({ email: email}).select("+password");
  if (user) {
    const token = user.getJWTToken();
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    console.log("Generated token : ", token);
    res
      .status(200)
      .cookie("token", token, options)
      .send({ success: "true", message: "successfully logged in" });
  } else {
    res
      .status(400)
      .send({ success: "false", message: "Incorrect User Email and Password" });
  }
};

//sign up
exports.registerUser = async (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  const isMatch = await User.findOne({ email: email });
  if (isMatch) {
    res.status(400).send({ success: "false", message: "Email Already Exists" });
  } else {
    const user = await User.create({ name, email, password });
    // await user.save();

    //generating cookie
    const token = user.getJWTToken();
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).send({ success: "true", user });
  }
};

//Log out
exports.logoutUser = async (req, res) => {

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  res.status(200).send({ success: "true", "message": "Successfully Logged Out" });
};