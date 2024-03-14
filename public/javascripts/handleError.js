const mongoose = require('mongoose');

const handleError = (err, moduleName, options = {}) => {
    const { message } = options;
    const server = {
        code: 500,
        category: 'Internal Server Error',
        message: message || 'Internal Server Error',
    }

    console.error(`\n>>>>>>>>>>\nAn Error occured in ${moduleName}:`);
    console.log(`Details:\nName: ${err.name || null}`);
    console.log(`Reason: ${err.reason || null}`);
    console.log(`<<<<<Error>>>>>\n${err}`);
    switch (err.name) {
        case mongoose.Error.MongooseServerSelectionError.name:
            server.message = 'Could not connect to the server database'
            break;
    }
    return { result: 'error', details: err, server: { ...server } }
};

module.exports = handleError;
