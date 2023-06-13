const passport = require('passport');
const User = require('../models/userSchema');

var GoogleStrategy = require('passport-google-oauth2').Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_HOST}/auth/google/callback`,
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        // Find or Create user here
        User.findOne({ email: profile.email }).then((currentUser) => {
            if (currentUser) {
                // already have this user
                // console.log('user is: ', profile);
                // if we already have a record with the given email id check for googleId, if it is not there insert it
                if (!currentUser.googleId) {
                    currentUser.googleId = profile.id;
                    currentUser.save();
                }
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