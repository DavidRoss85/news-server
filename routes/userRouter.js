const express = require('express');
const userRouter = express.Router();
const DEFAULTS = require('../public/javascripts/DEFAULTS')

userRouter.use(express.json());
userRouter.route('/')
    .post((req, res) => {
        //bla bla bla... authenticate... then
        console.log('\n***\nReceived a post request: ', req.body);
        if (req.body.request === 'GET-SETTINGS') {
            res.json(DEFAULTS.TEST_USER_SETTINGS);
        } else {
            res.statusCode = 403;
            res.json({ status: 'error' });
        }
        // ('This endpoint will return user information');
    })
    .put((req, res) => {
        //just echo the request for now:
        console.log('\n***\nReceived a put request: ', req.body);
        if (req.body.request === 'UPDATE-SETTINGS') {
            res.json(req.body.data);
        } else {
            res.statusCode = 403;
            res.json({ status: 'error' });
        }
    })

module.exports = userRouter;