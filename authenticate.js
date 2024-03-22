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

const verifyMe = async (payload, done) => {

    try {
        const user = await User.findOne({ _id: payload._id })
        if (user) {
            return done(null, user); //user found
        } else {
            return done(null, false); //no user found
        };

    } catch (err) {
        return done(err, false); //err occured
    }
};

exports.getToken = (user) => {
    return jwt.sign(user, mySecret, { expiresIn: TOKEN_TTL })
}

exports.jwtPassport = passport.use(new JwtStrategy(options, verifyMe));

exports.verifyUser = passport.authenticate('jwt', { session: false });