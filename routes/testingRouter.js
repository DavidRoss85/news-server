const express = require('express');
const testingRouter = express.Router();
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');
const handleError = require('../js/handleError');
const { systemLog } = require('../js/logHandler');
const { cors, corsWithOptions } = require('./corsModule');
const cacheHandler = require('../js/cacheHandler');

const rejectUser = (res) => {
    res.statusCode = 403
    res.setHeader('Content-Type', 'text');
    res.json('Unauthorized');
    return;
}

//Test database connection
testingRouter.route('/dbconnectionstatus')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors,
        async (req, res) => {
            const result = await dbHandler.getMongoStatus()
            console.log('Mongo Connection Status: ', result)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
            return;
        });

testingRouter.route('/writeCache')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors, authenticate.verifyUser,
        async (req, res) => {
            if (!req.user.admin) {
                rejectUser();
                return;
            }
            cacheHandler.writeCache('MyEntry', 'MyData!!')
            const result = { test: 'success' }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
            return;
        });

testingRouter.route('/readCache')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors, authenticate.verifyUser,
        async (req, res) => {
            if (!req.user.admin) {
                rejectUser();
                return;
            }
            const result = await cacheHandler.readCache('testResults')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
            return;
        });
testingRouter.route('/saveCache')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors, authenticate.verifyUser,
        async (req, res) => {
            if (!req.user.admin) {
                rejectUser();
                return;
            }
            cacheHandler.saveCache()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json');
            res.json({ result: 'executed' });
            return;
        });

testingRouter.route('/importCache')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors, authenticate.verifyUser,
        async (req, res) => {
            if (!req.user.admin) {
                rejectUser();
                return;
            }
            cacheHandler.importCache()
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json');
            res.json({ result: 'executed' });
            return;
        });

module.exports = testingRouter;