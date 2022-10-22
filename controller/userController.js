const User = require("../models/userSchema");


exports.loginUser = async (req, res) => {
  console.log(req.body.email, " and ", req.body.password);
  const { email, password } = req.body;
  const isMatch = await User.findOne({ email: email, password: password });
  if (isMatch) {
    res.status(200).send({ success: "true" });
  } else {
    res.status(400).send({ success: "false" });
  }
};

//sign up
exports.registerUser = async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  // const isMatch = await userSchema.findOne({ email: email });
  // if (isMatch) {
  //     res.status(400).send({ "success": "false" });
  // }
  // else {
  // await user.save();
  res.status(200).send({ success: "true", user });
  // }
};
