const DEFAULTS = require('../js/DEFAULTS')
const myNews = require('../js/newsAPI')
const express = require('express');
const newsRouter = express.Router();
const { corsWithOptions } = require('./corsModule');


newsRouter.use(express.json());
newsRouter.route('/')
    .options(corsWithOptions, (req, res) => res.sendStatus(200))
    .post(corsWithOptions, async (req, res) => {

        console.log('\n***\nRecieved a post request', JSON.stringify(req.body));

        if (req.body.request === 'search' && !!req.body.data) {

            if (req.body.data.endpoint === 'top-headlines' || req.body.data.endpoint === 'everything') {
                const newsResults = await myNews.results(req.body.data);
                res.json(newsResults);
            } else {
                //Add an error return object here:
                res.statusCode = 403;
                res.json(DEFAULTS.ERROR_NEWS);

            }
            return;
        }
        res.statusCode = 403;
        res.json(DEFAULTS.ERROR_NEWS);
    });

module.exports = newsRouter;