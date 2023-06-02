const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { buy, sell, allTrades, holdingQty } = require('../controller/trade');

// secure routes , authentication required
router.route("/buy").post(authenticate, buy);
router.route("/sell").post(authenticate, sell);
router.route("/all-trades").get(authenticate, allTrades);
router.route("/qty/:id").get(authenticate, holdingQty);
router.route("/tradeInfo/:id").get(authenticate, tradeInfo);

module.exports = router;