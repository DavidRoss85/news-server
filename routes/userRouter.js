const express = require('express');
const userRouter = express.Router();
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');
const handleError = require('../js/handleError');
const { systemLog } = require('../js/logHandler');
const { cors, corsWithOptions } = require('./corsModule');

const CONSOLE_SHOW = { consoleShow: false }

//New User:
userRouter.route('/signup')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .post(corsWithOptions, async (req, res) => {
        const { username, password, email, displayname } = req.body
        const result = await dbHandler.createNewUser({ username, email, password, displayname });
        const { details, ...rest } = result;
        res.statusCode = rest.code;
        res.setHeader('Content-Type', 'application/json');
        res.json(rest);
        return;
    });

//Login:
userRouter.route('/login')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .post(corsWithOptions, (req, res, next) => {
        systemLog('Request to /login', { message:'User: '+ req.body.username, ...CONSOLE_SHOW });
        req.body.username = req.body.username.toLowerCase();
        passport.authenticate('local', (err, user, info) => {
            systemLog('Attempting to authenticate login', { message: '', ...CONSOLE_SHOW });
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
                systemLog('Successfully logged in', { message:'User: ' + user.username, ...CONSOLE_SHOW });
                const token = authenticate.getToken({ _id: user._id });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                const { username, displayname } = user;
                // res.cookie('jwtNsLogin', token, { httpOnly: true })
                res.json({ result: 'success', validated: true, accessToken: token, username, displayname, details: user.username + ' validated', });
                return;
            }
        })(req, res, next);
    });

//Operations user settings:
userRouter.route('/settings')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(corsWithOptions, authenticate.verifyUser,
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
    .put(corsWithOptions, authenticate.verifyUser,
        async (req, res) => {
            // systemLog('Received a put request at /settings', { message: req.body, ...CONSOLE_SHOW })
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
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(corsWithOptions, authenticate.verifyUser,
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
    .put(corsWithOptions, authenticate.verifyUser,
        async (req, res) => {
            systemLog('Received a put request at /settings/' + req.params.userId, { message: req.body, ...CONSOLE_SHOW })
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
//checks to see if a username is available
userRouter.route('/queryusername/:username')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(corsWithOptions, async (req, res) => {
        const result = await dbHandler.queryUsername(req.params.username);
        const { details, ...rest } = result;
        // console.log('rest: ', rest)
        res.statusCode = rest.code;
        res.setHeader('Content-Type', 'application/json');
        res.json(rest);
        return;
    });

userRouter.route('/test')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors, (req, res) => {
        res.json({ message: 'The server is active' })
    })

//Not required with token verification
// userRouter.route('/logout')
//     .post(async (req, res, next) => {

//     })

module.exports = userRouter;