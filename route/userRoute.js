const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, isLoggedIn, loginGet, googleLogin, googleLoginCallback } = require('../controller/userController');

const authenticate = require("../middlewares/authenticate");

// public routes , no authentication required 
router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/login").get(loginGet);
router.route("/auth/google").get(googleLogin);
router.route("/auth/google/callback").get(googleLoginCallback);
router.route("/isLoggedIn").post(isLoggedIn);

// secure routes , authentication required
router.route("/logout").post(authenticate, logoutUser);
// router.route("/buy").post(authenticate, buy);
// router.route("/sell").post(authenticate, sell);
// router.route("/all-trades").get(authenticate, allTrades);


module.exports = router;