const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    const token = req.cookies.jwToken;
    if (!token) {
        res.status(401).send({ success: "false", error: "You are not LoggedIn, Please Login First" });
    }
    else {
        try {
            const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
            const crrUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });
            if (!crrUser) {
                res.status(401).send({ success: "false", error: "Unauthorized Request" });
            }
            req.token = token;
            req.crrUser = crrUser;
            req.userId = crrUser._id;
            next();
        }
        catch (err) {
            res.status(401).send({ success: "false", error: "You are not LoggedIn, Please Login First" });
        }
    }
}
module.exports = authenticate;