const express = require('express');
const loginRouter = express.Router();
const dbHandler = require('../public/javascripts/db/loginDbHandler');
const { db } = require('../public/javascripts/db/dbModels/userSettingModel');
//For testing purposes
testUser = {
    validated: true,
    username: 'User',
    password: 'Longpassword'
}

loginRouter.use(express.json());
loginRouter.route('/')
    .post(async (req, res) => {
        const userInfo = req.body.data;
        console.log('\n***\nRecieved login request: ', userInfo);
        //Replace this code with REAL login code
        const data = await dbHandler.validateUser(userInfo);
        if (data.result === 'success') {
            res.statusCode = 200;
            res.json(data);
            return;
        }
        res.statusCode = data.server.code;
        const {details, ...rest} = data;
        res.json(rest);
    })

loginRouter.route('/admin')
    .get(async (req, res) => {
        const data = await dbHandler.findAll();
        res.json(data);
    })
    .post(async (req, res) => {
        const userInfo = req.body.data
        const data = await dbHandler.createNewUser(userInfo)
        res.json(data)
    })
    .put(async (req, res) => {
        const userInfo = req.body.data;
        if (req.body.request === 'CHANGE-PASSWORD') {
            const data = await dbHandler.changePassword(userInfo);
            res.json(data)
            return;
        } else if (req.body.request === 'CHANGE-USERNAME') {
            const data = await dbHandler.changeUsername(userInfo);
            res.json(data)
            return;
        }
        res.statusCode = 403;
        res.json({ result: 'Unknown Request', details: 'Received a put request with improper request header' })
    })
    .delete(async (req, res) => {
        const userInfo = req.body.data;
        const data = await dbHandler.deleteUser(userInfo)
        res.json(data)
    })

module.exports = loginRouter;