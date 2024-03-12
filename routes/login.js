const express = require('express');
const loginRouter = express.Router();
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

module.exports = loginRouter;