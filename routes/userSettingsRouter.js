const express = require('express');
const userRouter = express.Router();
const DEFAULTS = require('../public/javascripts/DEFAULTS');
const dbHandler = require('../db/userSettingsDbHandler')

userRouter.use(express.json());
userRouter.route('/')
    .post(async (req, res) => {
        //bla bla bla... authenticate... then
        console.log('\n***\nReceived a post request: ', req.body);
        const userInfo = req.body.data;
        if (req.body.request === 'GET-SETTINGS') {
            const data = await dbHandler.getSettings(userInfo);
            if (data.result === 'success') {
                res.json(data);
            } else {
                const {details, ...rest} = data;
                res.statusCode = data.server.code;
                res.json(rest);
            }
        } else {
            res.statusCode = 403;
            res.json({ result: 'error', details: 'invalid request header' });
        }
    })
    .put(async (req, res) => {
        console.log('\n***\nReceived a put request: ', req.body);
        const settingsInfo = req.body.data;
        if (req.body.request === 'UPDATE-SETTINGS') {
            const data = await dbHandler.updateSettings(settingsInfo);
            if (data.result === 'success') {
                res.json(data);
            } else {
                res.statusCode = 500;
                res.json(data);
            }
        } else {
            res.statusCode = 403;
            res.json({ result: 'error', details: 'invalid request header' });
        }
    })
    .delete(async (req, res) => {
        console.log('\n***\nReceived a delete request: ', req.body);
        const settingsInfo = req.body.data;
        if (req.body.request === 'DELETE-SETTINGS') {
            const data = await dbHandler.deleteSettings(settingsInfo);
            res.json(data);
        } else {
            res.statusCode = 403;
            res.json({ result: 'error', details: 'invalid request header' });
        }

    });


//testing    
// userRouter.route('/test')
//     .get(async (req, res) => {
//         const data = await dbHandler.testFind();
//         res.json(data)
//     })
//     .post(async (req, res) => {
//         dbHandler.testCreate(DEFAULTS.DEFAULT_USER_SETTINGS)
//         res.end('Test create')
//     })
//     .put(async (req, res) => {
//         dbHandler.testEdit('defaultUser')
//         res.end('Test edit')
//     })
//     .delete(async (req, res) => {
//         dbHandler.testDelete('defaultUser')
//         res.end('Test edit')
//     })


module.exports = userRouter;