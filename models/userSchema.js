const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stocks_database', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Error is : ", err);
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new mongoose.model("Users", userSchema);

module.exports = UserSchema;