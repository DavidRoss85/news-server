const express = require('express');
const userRouter = express.Router();
//import dbHandler here...
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');
const handleError = require('../public/javascripts/handleError')



// userRouter.use(express.json());
userRouter.route('/signup')
    .post(async (req, res) => {
        const { username, password, email } = req.body
        const result = await dbHandler.createNewUser({ username, email, password });
        res.json(result);
    })

userRouter.post('/login', (req, res, next) => {
    console.log('Received post at /login');

    passport.authenticate('local', (err, user, info) => {
        console.log('Attempting to authenticate at /login')
        if (err) {
            const result = handleError(err, 'userRouter/post/login');
            const { code, category, message } = result.server;
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json');
            res.json({ result: 'error',code, category, message });
            return;
        }
        if (!user) {
            const result = handleError(info, 'userRouter/post/login');
            const { code, category, message } = result.server;
            res.statusCode = code;
            res.setHeader('Content-Type', 'application/json');
            res.json({ result: 'error',code, category, message });
            return;
        }
        if (user) {
            const token = authenticate.getToken({ _id: user._id });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            const { username, displayname } = user;
            res.json({ result: 'success', validated: true, token, username, displayname, details: user.username + ' validated', });
            return;
        }
    })(req, res, next);



});

//Not required with token verification
// userRouter.route('/logout')
//     .post(async (req, res, next) => {

//     })

module.exports = userRouter;