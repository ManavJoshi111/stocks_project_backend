const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/stocks_database', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => { console.log("Connected to database"); }).catch((err) => { console.log("Error in connecting to the database : ", err); });

const tradeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    cryptoSymbol: {
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
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Trade', tradeSchema);