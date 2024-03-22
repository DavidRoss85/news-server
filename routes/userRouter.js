const express = require('express');
const userRouter = express.Router();
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');
const handleError = require('../js/handleError');
const { systemLog } = require('../logs/logHandler');

const CONSOLE_SHOW ={consoleShow:true}

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
   systemLog('Received post at /login',{message: req.body.username, ...CONSOLE_SHOW});

    passport.authenticate('local', (err, user, info) => {
       systemLog('Attempting to authenticate login',{message:'', ...CONSOLE_SHOW});
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
            systemLog('Login success',{message: user.username, ...CONSOLE_SHOW});
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
            systemLog('Received a put request at /settings', {message: req.body, ...CONSOLE_SHOW})
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
            systemLog('Received a put request at /settings/' + req.params.userId, {message: req.body, ...CONSOLE_SHOW})
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

userRouter.route('/test')
.get((req,res)=>{
    if(req.cookies){
        res.json({message:'There are cookies',cookies: req.cookies})
    
    }else{
        res.json({message:'There are no cookies'})
    }
})

//Not required with token verification
// userRouter.route('/logout')
//     .post(async (req, res, next) => {

//     })

module.exports = userRouter;