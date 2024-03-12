const DEFAULTS = require('../public/javascripts/DEFAULTS')
const myNews = require('../public/javascripts/newsAPI')
const express = require('express');
const newsRouter = express.Router();


newsRouter.use(express.json());
newsRouter.route('/')
    // .all((req, res, next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json')
    //     res.appendHeader('Access-Control-Allow-Origin', '*');
    //     res.appendHeader('Access-Control-Allow-Credentials', 'true');
    //     res.appendHeader('Access-Control-Allow-Methods', '*');
    //     res.appendHeader('Access-Control-Allow-Headers', '*')
    //     next();
    // })
    .post(async (req, res) => {

        console.log('Recieved a post request', JSON.stringify(req.body));

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