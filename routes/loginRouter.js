const express = require('express');
const loginRouter = express.Router();
const dbHandler= require('../public/javascripts/userDbHandler');
//For testing purposes
testUser = {
    validated: true,
    username: 'User',
    password: 'Longpassword'
}

loginRouter.use(express.json());
loginRouter.route('/')
    // .all((req, res, next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json')
    //     res.appendHeader('Access-Control-Allow-Origin', '*');
    //     res.appendHeader('Access-Control-Allow-Credentials', 'true');
    //     res.appendHeader('Access-Control-Allow-Methods', '*');
    //     res.appendHeader('Access-Control-Allow-Headers', '*')
    //     next();
    // })
    .post((req, res) => {
        console.log('\n***\nRecieved login request: ', req.body);

        //Replace this code with REAL login code
        if (req.body.username && req.body.password === testUser.password) {
            res.json({...testUser, password: 'is good!'});
            return;
        }
        res.json({ validated: false });
    })
//testing:
loginRouter.route('/test')
    .get((req, res) => {
        dbHandler.testFind();
        res.end('Test find')
    })
    .post((req,res)=>{
        dbHandler.testCreate()
        res.end('Test create')
    })
    .put((req,res)=>{
        dbHandler.testEdit('user')
        res.end('Test edit')
    })
    .delete((req,res)=>{
        dbHandler.testDelete('user')
        res.end('Test edit')
    })

module.exports = loginRouter;