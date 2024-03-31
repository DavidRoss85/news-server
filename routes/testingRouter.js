const express = require('express');
const testingRouter = express.Router();
const dbHandler = require('../db/dbHandler');
const authenticate = require('../authenticate');
const passport = require('passport');
const handleError = require('../js/handleError');
const { systemLog } = require('../logs/logHandler');
const { cors, corsWithOptions } = require('./corsModule');

//Test database connection
testingRouter.route('/dbconnectionstatus')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors, async (req, res) => {
        const result = await dbHandler.getMongoStatus()
        console.log('Mongo Connection Status: ', result)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json');
        res.json(result);
        return;
    });


module.exports = testingRouter;