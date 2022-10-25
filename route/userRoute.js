const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, isLoggedIn } = require('../controller/userController');

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/isLoggedIn").post(isLoggedIn);

module.exports = router;