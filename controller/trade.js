const User = require("../models/userSchema");
const Trade = require("../models/tradeSchema");
const mongoose = require("mongoose");

exports.buy = async (req, res) => {
    const uid = req.userId;
    const { cryptoId, price, quantity } = req.body;
    if (
        cryptoId == null ||
        isNaN(price) ||
        price <= 0 ||
        isNaN(quantity) ||
        quantity <= 0
    ) {
        res.status(400).send("Invalid input format!");
        return;
    }

    const user = await User.findOne({ _id: uid });

    if (user) {
        console.log("id : ", uid);
        console.log("Budget : ", user.name);
        console.log("Price : ", price * quantity);

        if (user.budget > price * quantity) {
            const trade = new Trade({
                userId: uid,
                cryptoSymbol: cryptoId,
                price: price,
                quantity: quantity,
                type: "buy"
            });
            trade.save();
            console.log("Budget : ", user.budget);
            User.updateOne(
                { _id: uid },
                { $inc: { budget: -price * quantity, investment: price * quantity } },
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                    } else {
                        res.status(200).json({ message: "Purchase Successful", tradeInfo: trade });
                        console.log(result);
                    }
                }
            );
        } else {
            res.status(400).send("Insufficient Funds");
        }
    } else {
        res.status(400).send("User not found");
    }
};

exports.sell = async (req, res) => {

    const uid = req.userId;
    const { cryptoId, price, quantity } = req.body;
    if (
        cryptoId == null ||
        isNaN(price) ||
        price <= 0 ||
        isNaN(quantity) ||
        quantity <= 0
    ) {
        return res.status(400).send("Invalid input format!");
    }

    console.log("\ncryotoID : " + cryptoId + "\nprice : " + price + "\nquantity : " + quantity);

    try {
        const user = await User.findOne({ _id: uid });
        if (user) {

            try {
                const result = await Trade.aggregate([
                    {
                        $match: {
                            'userId': user._id.toString(),
                            'cryptoSymbol': cryptoId,
                            'type': 'buy'
                        }
                    },
                    {
                        $group: {
                            '_id': null,
                            'totalQuantityBought': {
                                '$sum': '$quantity'
                            }
                        }
                    }, {
                        $lookup: {
                            'from': 'trades',
                            'pipeline': [
                                {
                                    '$match': {
                                        'userId': user._id.toString(),
                                        'cryptoSymbol': cryptoId,
                                        'type': "sell",
                                    },
                                }, {
                                    '$group': {
                                        '_id': null,
                                        'totalQuantitySold': {
                                            '$sum': '$quantity'
                                        }
                                    }
                                }
                            ],
                            as: 'sells'
                        }
                    },
                    {
                        $addFields: {
                            'totalQuantitySold': {
                                $sum: '$sells.totalQuantitySold'
                            },
                            'remainingQuantity': {
                                $subtract: [
                                    '$totalQuantityBought', {
                                        $ifNull: [
                                            {
                                                $sum: '$sells.totalQuantitySold'
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            '_id': 0,
                            'remainingQuantity': 1
                        }
                    }
                ]);

                const remainingQuantity =
                    result.length > 0 ? result[0].remainingQuantity : 0;

                console.log("agg result : " + JSON.stringify(result, null, 2));

                if (remainingQuantity >= quantity) {
                    const trade = new Trade({
                        userId: uid,
                        cryptoSymbol: cryptoId,
                        type: "sell",
                        price: price,
                        quantity: quantity
                    });
                    try {

                        trade.save();

                        User.updateOne(
                            { _id: uid },
                            { $inc: { budget: price * quantity, investment: -price * quantity } },
                            function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).send(err);
                                } else {
                                    // console.log(result);
                                    console.log("Sell trade saved successfully");
                                    return res.status(200).json({ message: "Sell trade saved successfully", tradeInfo: trade });
                                }
                            }
                        );
                    } catch (error) {
                        console.log("Error saving sell trade:", err);
                        return res
                            .status(500)
                            .send("Internal server error while saving sell trade...");
                    }
                } else {
                    console.log("Not enough remaining quantity to sell");
                    return res.status(400).send("Not enough holdings to sell");
                }
            } catch (err) {
                console.log("Error checking remaining quantity:", err);
                return res
                    .status(500)
                    .send("Internal server error while checking quantity...");
            }
        }
        else {
            res.status(403).send("unauthorized");
        }
    } catch (err) {
        console.log("unknown error in sell route :", err);
        res.status(500).send("Internal server error...");
    }
};

exports.allTrades = async (req, res) => {
    const uid = req.userId;
    console.log("inside all trades route....");
    const buyChecked = req.query.buyChecked;
    const sellChecked = req.query.sellChecked;
    console.log("buyChecked : " + buyChecked);
    console.log("sellChecked : " + sellChecked);
    if (buyChecked === 'true' && sellChecked === 'false') {
        try {
            const trades = await Trade.find({ userId: uid, type: "buy" }).select(
                "-userId -__v"
            );
            res.send(trades);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    else if (buyChecked === 'false' && sellChecked === 'true') {
        try {
            const trades = await Trade.find({ userId: uid, type: "sell" }).select(
                "-userId -__v"
            );
            res.send(trades);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    else {
        try {
            const trades = await Trade.find({ userId: req.userId }).select(
                "-userId -__v"
            );
            res.send(trades);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

exports.holdingQty = async (req, res) => {
    const uid = req.userId;

    const cryptoId = req.params['id'];

    console.log("uid in holdingQty : " + uid + " " + cryptoId);
    try {

        const holdingQty = await Trade.aggregate([
            {
                $match: {
                    'userId': uid.toString(),
                    'cryptoSymbol': cryptoId,
                },
            },
            {
                $group: {
                    '_id': null,
                    'totalHoldingQty': {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "buy"] },
                                "$quantity",
                                { $multiply: ["$quantity", -1] },
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    '_id': 0,
                    'totalHoldingQty': 1,
                },
            }
        ]);

        console.log(holdingQty);


        return res.status(200).json({ holdingQty: holdingQty[0].totalHoldingQty });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.dashboardData = async (req, res) => {
    const uid = req.userId;

    try {
        const data = await Trade.aggregate([
            {
                $match: {
                    userId: uid.toString()
                }
            },
            {
                $group: {
                    _id: {
                        cryptoSymbol: "$cryptoSymbol",
                        type: "$type"
                    },
                    totalQuantity: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "buy"] },
                                "$quantity",
                                { $multiply: ["$quantity", -1] }
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.cryptoSymbol",
                    totalHoldingQty: {
                        $sum: "$totalQuantity"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    cryptoSymbol: "$_id",
                    totalHoldingQty: 1
                }
            }
        ]);


        return res.status(200).json(trades);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.tradeInfo = async (req, res) => {

    const uid = req.userId;
    const tradeId = req.params["id"];

    try {
        const tradeInfo = await Trade.find({ _id: tradeId, userId: uid }).select(
            "-userId -__v"
        );
        return res.status(200).json(tradeInfo);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}