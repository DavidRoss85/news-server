const express = require('express');
const userRouter = express.Router();

userRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end('This endpoint will return user information');
    })

module.exports = userRouter;