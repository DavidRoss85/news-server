const { now } = require('mongoose');
const fs = require('node:fs');
const path = require('path');
const systemFile = path.join(__dirname, 'system.log')

module.exports.systemLog = (event, options = {}) => {
    if (typeof options === 'string') {
        options = { message: options };
    };

    const {
        consoleShow = false,
        isErr = false,
        logFile = true,
        message = '',
        moduleName = null,
        lineBreak = '',
    } = options;

    if (consoleShow) {
        if (isErr) {
            console.error(`\n\n!!!An Error occured in ${moduleName || 'an unspecified module'}!!!`);
            console.log(`--Details--\nName: ${event.name || 'unspecified'}`);
            console.log('Reason: ', event.reason || 'unspecified');
            console.log(`\n**Error Object**\n`, event);
            console.log(`\---END ERR MESSAGE---\n`);
        } else {
            if (lineBreak !== null) {
                console.log(lineBreak);
            }
            console.log(event, message);
        };
    };
    if (logFile) {
        const logEntry = `${Date.now()},${isErr ? 'Error' : 'Event'},${event},${message}\n`
        //Time, Type, Err, Display

        // console.log(logEntry);
        fs.appendFile(systemFile, logEntry, err => {
            if (err) {
                console.error(err);
            } else {
                return { result: 'success', details: 'Successfully logged event/err' }
            };
        });
    };
    return { result: 'failed', details: 'No log made' };
}