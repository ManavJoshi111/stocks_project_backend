const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stocks_database', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => { console.log("Connected to database"); }).catch((err) => { console.log("Error in connecting to the database : ", err); });

const tradeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    cryptoId: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    sold: {
        type: Boolean,
        default: false,
        required: true
    },
    remaining_quantity: {
        type: Number,
        default: function () { return this.quantity; },
    }
})

module.exports = mongoose.model('Trade', tradeSchema);