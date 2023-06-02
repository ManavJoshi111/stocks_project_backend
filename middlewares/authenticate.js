const User = require('../models/userSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ success: "false", error: "You are not LoggedIn, Please Login First" });
    }
    else {
        try {
            const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
            const crrUser = await User.findOne({ _id: verifyToken.id });

            if (!crrUser) {
                return res.status(401).send({ success: "false", error: "Unauthorized Request" });
            }
            req.token = token;
            req.crrUser = crrUser;
            req.userId = crrUser._id;
            next();
        }
        catch (err) {
            return res.status(401).send({ success: "false", error: "You are not LoggedIn, Please Login First..." });
        }
    }
}
module.exports = authenticate;