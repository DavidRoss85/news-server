const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); //sign and verify
const User = require('./db/models/userModel');

const TOKEN_TTL = 86400; // ONE DAY
const mySecret = process.env.SECRET_KEY

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = mySecret;

const verifyMe = (payload, done) => {
    User.findOne({ _id: payload._id },
        (err, user) => {
            if (err) {
                return done(err, false); //err occured
            } else if (user) {
                console.log('YAAAAAAAAAAAYYYYYYY')
                return done(null, user); //user found
            } else {
                console.log('BOOOOOOOOOOOOOOOOOOO')
                return done(null, false); //no user found
            };
        });
};

exports.getToken = (user) => {
    return jwt.sign(user, mySecret, { expiresIn: TOKEN_TTL })
}

exports.jwtPassport = passport.use(new JwtStrategy(options, verifyMe));

exports.verifyUser = passport.authenticate('jwt', { session: false });