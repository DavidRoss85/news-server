const mongoose = require('mongoose');

const handleError = (err, moduleName, options = {}) => {
    const {
        consoleShow = true,
        override = false,
        code = 500,
        category = 'Internal Server Error',
        message = 'An unhandled internal server error occurred',
    } = options;

    const server = {
        code,
        category,
        message,
    }

    //Console log the error
    if (consoleShow) {
        console.error(`\n<<<<<\nAn Error occured in ${moduleName || 'an unspecified module'}>>>>>`);
        console.log(`Details:\nName: ${err.name || null}`);
        console.log('Reason: ',err.reason || null);
        console.log(`<<<<<Error>>>>>\n${err}`);
    }

    //Specify error messages
    //Since mongodb and mongoose don't seem to return consistent errors/messages,
    //the below code will handle identified scenarios.

    switch (err.code) {
        case 11000:
            if (err.keyPattern) {
                const dupField = Object.getOwnPropertyNames(err.keyPattern)[0];
                if (dupField === 'email') {
                    server.code = 409;
                    server.category = 'Duplicate email'
                    server.message = 'That email address is already registered on this server'
                } else {
                    server.message = 'Attempt to enter a non-unique value in ' + dupField;
                };
            };
            break;
    }

    switch (err.name) {
        case 'NoUserName':
            server.code = 403;
            server.category = 'Incomplete';
            server.message = 'Username is required';
            break;
        case 'NoPassword':
            server.code = 403;
            server.category = 'Incomplete';
            server.message = 'Password is required'
            break;
        case 'NoEmail':
            server.code = 403;
            server.category = 'Incomplete';
            server.message = 'Email is required';
            break;
        case 'UserExistsError':
            server.code = 409;
            server.category = 'Error creating user'
            server.message = err.message
            break;
        case mongoose.Error.MongooseServerSelectionError.name || 'MongoServerSelectionError':
            server.message = 'Could not connect to the server database'
            break;
        case 'MongooseError':
            if (err.message.includes('buffering timed out')){
                server.message = 'Error communicating with the database: The server took too long to respond'
            };
            break;
    }
    if (override) {
        server.message = message;
    }
    return { result: 'error', details: err, server: { ...server } }
};


module.exports = handleError;
