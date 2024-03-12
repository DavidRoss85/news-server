const express = require('express');
const userRouter = express.Router();
const DEFAULTS = require('../public/javascripts/DEFAULTS');
const dbHanlder = require('../public/javascripts/dbHandler')

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
    });
//testing:
userRouter.route('/test')
    .get((req, res) => {
        dbHanlder.testFind();
        res.end('Test find')
    })
    .post((req,res)=>{
        dbHanlder.testCreate()
        res.end('Test create')
    })
    .put((req,res)=>{
        dbHanlder.testEdit('user')
        res.end('Test edit')
    })
    .delete((req,res)=>{
        dbHanlder.testDelete('user')
        res.end('Test edit')
    })


module.exports = userRouter;