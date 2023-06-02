const passport = require('passport');
const User = require('../models/userSchema');

var GoogleStrategy = require('passport-google-oauth2').Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        // Find or Create user here
        User.findOne({ email: profile.email }).then((currentUser) => {
            if (currentUser) {
                // already have this user
                // console.log('user is: ', profile);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                new User({
                    name: profile.displayName,
                    email: profile.email,
                    googleId: profile.id
                }).save().then((newUser) => {
                    // console.log('created new user: ', newUser);
                    done(null, newUser);
                });
            }
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});