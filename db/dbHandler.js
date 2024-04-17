const url = process.env.MONGO_SERVER_URL //'mongodb://127.0.0.1:27017/newsFeedData';
// const url = 'mongodb://127.0.0.1:27017/newsFeedData';
const mongoose = require('mongoose');
const passport = require('passport');
const authenticate = require('../authenticate')
const User = require('./models/userModel');
const UserSetting = require('./models/userSettingModel');
const handleError = require('../js/handleError');
const { systemLog } = require('../js/logHandler');
const { sleep } = require('../js/utils');

//Event handlers:
mongoose.connection.on('connected', () => systemLog('--Mongo DB Connected--', { consoleShow: true }));
mongoose.connection.on('open', () => systemLog('--Mongo DB Connection *Open*--', { consoleShow: true }));
mongoose.connection.on('disconnected', () => systemLog('xx Mongo DB Disconnected xx', { consoleShow: true }));
mongoose.connection.on('reconnected', () => systemLog('--Mongo DB reconnected--', { consoleShow: true }));
mongoose.connection.on('disconnecting', () => systemLog('>>Disconnecting from DB<<', { consoleShow: true }));
mongoose.connection.on('close', () => systemLog('xx Mongo DB Connection *Closed* xx', { consoleShow: true }));





//connect db:
exports.connectToDatabase = async () => {
    // systemLog(`Attempting to connect to database`, { consoleShow: true });
    let result = {};
    try {
        if (mongoose.connection.readyState === 0) { //0 = not connected
            await mongoose.connect(url);//mongoose.createConnection(url).asPromise()
            result = { result: 'connected', details: `Connected to database` };

        } else if (mongoose.connection.readyState === 3) { //disconneting
            await sleep(5000); //wait 5 seconds to allow database to disconnect before attempting another
            await mongoose.connect(url);
            result = { result: 'connected', details: `Connected to database` };

        } else { // 1 (connected) or 2 (connecting)
            result = { result: 'connected', details: `Already connected to database` }
        }
        // systemLog(result.details, { consoleShow: true });
    } catch (err) {
        result = handleError(err, 'dbHandler/connectToDatabase');

    } finally {
        return result;

    };
};

//disconnect db:
exports.disconnectFromDatabase = async () => {
    let result = {};
    try {
        await mongoose.connection.close();
        result = { result: 'disconnected', details: `Disconnected from database at ${url}` };
        // systemLog(result.details, { consoleShow: true });
    } catch (err) {
        result = handleError(err, 'dbHandler/disconnectFromDatabase');
    } finally {
        return result;
    };
};

//-----------------
//User handlers
//-----------------

//New user:
exports.createNewUser = async (userInfo) => {
    const { username, password, email, displayname, notes } = userInfo;
    if (!username) return handleError('NoUserName', 'dbHandler/createNewUser', { consoleShow: false });
    if (!password) return handleError('NoPassword', 'dbHandler/createNewUser', { consoleShow: false });
    if (!email) return handleError('NoEmail', 'dbHandler/createNewUser', { consoleShow: false });

    let result = {};
    await ensureConnection();
    try {
        const lowerCaseUsername = username.toLowerCase()
        const user = await User.register(new User({ username: lowerCaseUsername, email, displayname, notes }), password)
        result = { result: 'success', code: 200, category: 'Register', message: 'Registration Successful for ' + user.username, details: 'Successfully registered user (' + user.username +')' };
        systemLog(result.details, { consoleShow: true });
    } catch (err) {
        result = handleError(err, 'dbHandler/createNewUser');
    } finally {
        return result;
    };

};
//Delete user:
exports.deleteUser = async (userInfo, options = {}) => {
    const { _id, username, email } = userInfo;
    if (!username && !_id && !email) return handleError('NoUserName', 'dbHandler/deleteUser');
    const { findBy = 'id' } = options;
    const searchObj = {}
    switch (findBy) {
        case 'id':
            searchObj._id = _id;
            break;
        case 'username':
            searchObj.username = username;
            break;
        case 'email':
            searchObj.email = email;
            break;
        default:
            searchObj._id = _id;
    };

    let result = {};
    await ensureConnection();
    try {
        const res = await User.findOneAndDelete(searchObj);
        if (res) {
            result = { result: 'success', code: 200, category: 'Delete', message: 'User ' + res.username + ' deleted', details: 'User ('+ res.username + ') deleted' };
            systemLog(result.details, { consoleShow: true });
        } else {
            result = handleError('UserDoesntExistsError', 'dbHandler/deleteUser');
        };

    } catch (err) {
        result = handleError(err, 'dbHandler/deleteUser');
    } finally {
        const allUsers = await User.find();
        // systemLog(`${allUsers.length} users left in database`, { consoleShow: true });
        return result;
    };
};
//Check if user exists
module.exports.queryUsername = async (username) => {
    if (!username) return handleError('NoUserName', 'dbHandler/queryUsername', { consoleShow: false });

    let result = {}
    try {
        const lowerCaseUsername = username.toLowerCase()
        const res = await User.findOne({ username: lowerCaseUsername });
        result = res ? { result: false, code: 200, category: 'Username search', message: 'Username unavailable' }
            :
            { result: true, code: 200, category: 'Username search', message: 'Username available' };
    } catch (err) {
        result = handleError(err, 'dbHandler/queryUsername');
    } finally {
        return result;
    }
};
//changePassword:
//...code goes here

//editUser
//...code goes here


//-----------------
//Settings handlers
//-----------------

//Add settings
exports.createNewSettings = async (settingsInfo) => {
    const { _id, ...rest } = settingsInfo;
    if (!_id || !settingsInfo || (settingsInfo instanceof Object !== true)) return handleError('InvalidDataError', 'dbHandler/createNewSettings');

    let result = {};
    await ensureConnection();
    try {
        const user = await UserSetting.findOne({ userId: _id })
        if (!user) {
            const res = await UserSetting.create({ userId: _id, ...rest });
            result = { result: 'success', code: 200, category: 'Settings', message: 'New settings created ', data: res, details: 'created new user settings for ' + _id };
            systemLog(result.details, { consoleShow: true });
        } else {
            result = handleError('UserExistsError', 'dbHandler/createNewSettings');
        }

    } catch (err) {
        result = handleError(err, 'dbHandler/createNewSettings');

    } finally {
        return result;
    };
};
//Update Settings:
exports.updateSettings = async (settingsInfo) => {
    const { _id, ...rest } = settingsInfo;
    if (!settingsInfo || !_id || (settingsInfo instanceof Object !== true)) return handleError('InvalidDataError', 'dbHandler/updateSettings');
    let result = {};
    await ensureConnection();
    try {
        const res = await UserSetting.findOneAndUpdate({ userId: _id }, rest, { new: true });
        result = res ?
            { result: 'success', code: 200, category: 'Settings', message: 'Settings updated', data: res, details:'Settings updated for User '+ res._id  }
            :
            this.createNewSettings(settingsInfo);
        systemLog(result.details, { consoleShow: true });
    } catch (err) {
        result = handleError(err, 'dbHandler/updateSettings');

    } finally {
        return result;
    };

};
//Delete Settings:
exports.deleteSettings = async (settingsInfo) => {
    const { _id } = settingsInfo;
    if (!_id) return handleError('InvalidDataError', 'dbHandler/deleteSettings');
    let result = {};
    try {
        const res = await UserSetting.findOneAndDelete({ userId: _id });
        if (res) {
            result = { result: 'success', code: 200, category: 'Settings', message: 'Settings deleted ', details:'Settings deleted for User '+ _id  };
            systemLog(result.details, { consoleShow: true });
        } else {
            result = handleError('UserDoesntExistsError', 'dbHandler/deleteSettings');

        };


    } catch (err) {
        result = handleError(err, 'dbHandler/deleteSettings');

    } finally {
        const allUsers = await UserSetting.find();
        systemLog(`${allUsers.length} left in database`, { consoleShow: true });
        return result;
    };

};
//Get Settings:
exports.getSettings = async (userInfo) => {
    const { _id } = userInfo;
    if (!_id) return handleError('InvalidDataError', 'dbHandler/getSettings');
    let result = {};
    await ensureConnection();
    try {
        const res = await UserSetting.findOne({ userId: _id });
        if (res) {
            result = { result: 'success', code: 200, category: 'Settings', message: 'Settings retrieved', data: res, details: res._id + ' settings retrieved' }
            // systemLog(result.details, { consoleShow: true });
        } else {
            result = handleError('UserSettingsDoesntExistsError', 'dbHandler/getSettings')
        };

    } catch (err) {
        result = handleError(err, 'dbHandler/getSettings');

    } finally {
        return result;
    };

};

exports.getMongoStatus = async ()=>{
    return {connectionStatus: mongoose.connection.readyState}
}

const ensureConnection = async () => {
    try {
        if (mongoose.connection.readyState === 0) { //0 = not connected
            await this.connectToDatabase()
        }
    } catch (err) {
        result = handleError(err, 'dbHandler/connectToDatabase');

    };
};