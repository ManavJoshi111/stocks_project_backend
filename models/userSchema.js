const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log("Error in connecting to the database : ", err);
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
    },
    googleId: {
        type: String,
        default: null
    },
    contact: {
        type: Number,
        max: [9999999999, "Contact number cannot exceed 10 digits"],
        min: [1000000000, "Contact number should have 10 digits"],
    },
    email: {
        type: String,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        minLength: [8, "Password should be greater than or equal to 8 characters"],
    },
    date: {
        type: Date,
        default: Date.now()
    },
    budget: {
        type: Number,
        default: 1000000
    },
    profit: {
        type: Number,
        default: 0
    },
    investment: {
        type: Number,
        default: 0
    }
});

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

//JWT Token
userSchema.methods.getJWTToken = async function () {
    try {
        let token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
        // this.tokens = this.tokens.concat({ token });
        // await this.save();
        // console.log("ID is : ", this._id);
        return token;
    }
    catch (err) {
        console.log(err);
    }
};


module.exports = mongoose.model("Users", userSchema);
