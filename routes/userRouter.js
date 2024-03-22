const express = require('express');
const userRouter = express.Router();
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');
const handleError = require('../js/handleError')


//New User:
userRouter.route('/signup')
    .post(async (req, res) => {
        const { username, password, email } = req.body
        const result = await dbHandler.createNewUser({ username, email, password });
        const { details, ...rest } = result;
        res.statusCode = rest.code;
        res.setHeader('Content-Type', 'application/json');
        res.json(rest);
        return;
    });

//Login:
userRouter.post('/login', (req, res, next) => {
    console.log('Received post at /login');

    passport.authenticate('local', (err, user, info) => {
        console.log('Attempting to authenticate at /login')
        if (err) {
            const result = handleError(err, 'userRouter/post/login');
            const { details, ...rest } = result;
            res.statusCode = rest.code;
            res.setHeader('Content-Type', 'application/json');
            res.json(rest);
            return;
        }
        if (!user) {
            const result = handleError(info, 'userRouter/post/login');
            const { details, ...rest } = result;
            res.statusCode = rest.code;
            res.setHeader('Content-Type', 'application/json');
            res.json(rest);
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

//Operations user settings:
userRouter.route('/settings')
    .get(authenticate.verifyUser,
        async (req, res, next) => {
            if (req.user.admin === true) {
                //Do admin only process:
                //return
            }
            const result = await dbHandler.getSettings({ _id: req.user._id });
            const { details, ...rest } = result;
            res.statusCode = rest.code;
            res.setHeader('Content-Type', 'application/json');
            res.json(rest);
            return;
        })
    .put(authenticate.verifyUser,
        async (req, res) => {
            console.log('Received a put request', req.body)
            if (req.user.admin === true) {
                //Do admin only process:
            }
            const result = await dbHandler.updateSettings({ _id: req.user._id, ...req.body.data });
            const { details, ...rest } = result;
            res.statusCode = rest.code;
            res.setHeader('Content-Type', 'application/json');
            res.json(rest);
            return;

        })

userRouter.route('/settings/:userId')
    .get(authenticate.verifyUser,
        async (req, res, next) => {
            if (`${req.user._id}` === `${req.params.userId}` || req.user.admin === true) {
                //No admin only access same id:
                const result = await dbHandler.getSettings({ _id: req.params.userId });
                const { details, ...rest } = result;
                res.statusCode = rest.code;
                res.setHeader('Content-Type', 'application/json');
                res.json(rest);
                return;
            } else {
                const result = handleError('DeniedError', 'userRouter/get/settings/' + req.params.userId);
                const { details, ...rest } = result;
                res.statusCode = rest.code;
                res.setHeader('Content-Type', 'application/json');
                res.json({ ...rest, userId: req.user._id });
                return;
            };
        })
    .put(authenticate.verifyUser,
        async (req, res) => {
            console.log('Received a put request', req.body)
            if (`${req.user._id}` === `${req.params.userId}` || req.user.admin === true) {
                //if admin or same id:
                const result = await dbHandler.updateSettings({ _id: req.params.userId, ...req.body.data });
                const { details, ...rest } = result;
                res.statusCode = rest.code;
                res.setHeader('Content-Type', 'application/json');
                res.json(rest);
                return;
            } else {
                const result = handleError('DeniedError', 'userRouter/get/settings/' + req.params.userId);
                const { details, ...rest } = result;
                res.statusCode = rest.code;
                res.setHeader('Content-Type', 'application/json');
                res.json(rest);
                return;
            };
        })



//Not required with token verification
// userRouter.route('/logout')
//     .post(async (req, res, next) => {

//     })

module.exports = userRouter;