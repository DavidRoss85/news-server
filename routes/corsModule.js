const { systemLog } = require('../logs/logHandler');
const cors = require('cors');
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];


const corsOptionsDelegate = (req, cb) => {
    let corsOptions;
    systemLog('Request from: ' + req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    cb(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);

// CORS STUFF:
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// app.use(cors(corsOptions));

// app.use((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json')
//     res.appendHeader('Access-Control-Allow-Origin', '*');
//     res.appendHeader('Access-Control-Allow-Credentials', 'true');
//     res.appendHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.appendHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
//     next();
//   });
