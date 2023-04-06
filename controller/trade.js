const User = require('../models/userSchema');
const Trade = require('../models/tradeSchema');

exports.purchase = async (req, res) => {
    const { uid, cryptoId, price, quantity } = req.body;
    console.log("in purchase : ", uid, cryptoId, price, quantity);
    const user = await User.findOne({ _id: uid });
    if (user) {
        console.log("id : ", uid);
        console.log("Budget : ", user.name);
        console.log("Price : ", price * quantity);
        if (user.budget > price * quantity) {
            const trade = new Trade({
                userId: uid,
                cryptoId: cryptoId,
                price: price,
                quantity: quantity,
                sold: false
            });
            trade.save();
            console.log("Budget : ", user.budget);
            User.updateOne({ _id: uid }, { $inc: { budget: -price * quantity } }, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                }
                else {
                    res.status(200).send("Purchase Successful");
                    console.log(result);
                }
            });
        }
        else {
            res.status(400).send("Insufficient Funds");
        }
    }
    else {
        res.status(400).send("User not found");
    }

}
exports.sell = async (req, res) => {
    let { uid, cryptoId, price, quantity } = req.body;
    const user = await User.findOne({ _id: uid });
    if (user) {
        const trades = await Trade.find({ userId: uid, cryptoId: cryptoId });
        console.log(trades);
        // Check if user has suitable shares


        let sold = false;
        trades.forEach((trade) => {
            if (!trade.sold) {
                console.log(trade);
                if (trade.remaining_quantity >= quantity) {
                    console.log("In if");
                    Trade.updateOne({ _id: trade._id }, { $set: { remaining_quantity: 0, sold: true } }, (err, result) => {
                        if (err) { console.log(err); } else { console.log(result); }
                    });
                    quantity -= trade.remaining_quantity;
                }
                if (quantity == 0) return;
            }
        });
        User.updateOne({ _id: uid }, { $inc: { budget: price * quantity } }, function (err, result) {
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            else {
                res.status(200).send("Purchase Successful");
                console.log(result);
            }
        });
    }
}
