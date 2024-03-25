const express = require('express');
const router = express.Router();
const { cors, corsWithOptions } = require('./corsModule');

/* GET home page. */
router.route('/')
  .options(corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors, function (req, res, next) {
    res.render('index', { title: 'Express' });
  });

module.exports = router;
