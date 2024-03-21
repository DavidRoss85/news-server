const express = require('express');
const userRouter = express.Router();
//import dbHandler here...
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');



// userRouter.use(express.json());
userRouter.route('/signup')
    .post(async (req, res) => {
        const { username, password, email } = req.body
        const result = await dbHandler.createNewUser({ username, email, password, req, res });
        res.json(result);
    })

userRouter.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const {username, displayname } = req.user;
    res.json({  result: 'success', validated: true, token, username,displayname,details: req.user.username + ' validated',});
});

userRouter.route('/logout')
    .post(async (req, res, next) => {

    })

module.exports = userRouter;