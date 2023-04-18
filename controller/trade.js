const User = require('../models/userSchema');
const Trade = require('../models/tradeSchema');

exports.purchase = async (req, res) => {
    const { uid, cryptoId, price, quantity } = req.body;
    if (quantity <= 0) {
        return res.status(400).send({ err: "Quantity must be a positive number" });
    }
    if (price <= 0) {
        return res.status(400).send({ err: "Price must be a positive number" });
    }
    try {
        const user = await User.findOne({ _id: uid });
        if (!user) {
            throw new Error('User not found');
        } else if (user.budget < price * quantity) {
            throw new Error('Insufficient funds');
        } else {
            const trade = new Trade({
                userId: uid,
                cryptoId: cryptoId,
                price: price,
                quantity: quantity,
                sold: false
            });
            await trade.save();
            await User.updateOne({ _id: uid }, { $inc: { budget: -price * quantity } });
            res.status(200).send({ msg: "Purchase Successful" });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ err: "An error occurred...! Please try after somtime" });
    }
};



exports.sell = async (req, res) => {
    let { uid, cryptoId, price, quantity } = req.body;
    console.log("In sell : ", quantity);
    if (quantity <= 0) {
        return res.status(400).send({ err: "Quantity must be a positive number" });
    }
    if (price <= 0) {
        return res.status(400).send({ err: "Price must be a positive number" });
    }
    const user = await User.findOne({ _id: uid });

    if (user) {
        const trades = await Trade.find({ userId: uid, cryptoId: cryptoId, sold: false })
            .sort({ date: 1 });
        let remainingQuantity = quantity;

        for (let i = 0; i < trades.length && remainingQuantity > 0; i++) {
            const trade = trades[i];
            console.log("In for");
            const availableQuantity = trade.remaining_quantity;

            if (remainingQuantity <= availableQuantity) {
                Trade.updateOne({ _id: trade._id }, { $set: { remaining_quantity: availableQuantity - remainingQuantity } }, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                    }
                });

                remainingQuantity = 0;
            } else {
                Trade.updateOne({ _id: trade._id }, { $set: { remaining_quantity: 0, sold: true } }, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                    }
                });

                remainingQuantity -= availableQuantity;
            }
        }

        if (remainingQuantity > 0) {
            res.status(400).send({ err: "Not enough shares to sell" });
        } else {
            User.updateOne({ _id: uid }, { $inc: { budget: price * quantity } }, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).send({ err: "An error occured..! Please try after sometime" });
                } else {
                    res.status(200).send({ msg: "Sale successful" });
                    console.log(result);
                }
            });
        }
    }
}

