const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); //sign and verify
const User = require('./public/javascripts/db/dbModels/userModel');

const mySecret = process.env.SECRET_KEY

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const options = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = mySecret;

function verifyMe(jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id },
        (err, user) => {
            if (err) {
                return done(err, false); //err occured
            } else if (user) {
                return done(null, user); //user found
            } else {
                return done(null, false); //no user found
            };
        });
};

exports.jwtPassport = passport.use(
    new JwtStrategy(options, verifyMe)
);

exports.verifyUser = passport.authenticate('jwt', { session: false });