const url = process.env.MONGO_LOCAL_URL //'mongodb://127.0.0.1:27017/newsFeedData';
const mongoose = require('mongoose');
const passport = require('passport');
const authenticate = require('../authenticate')
const User = require('./models/userModel');
const UserSetting = require('./models/userSettingModel');
const handleError = require('../js/handleError');

//Event handlers:
mongoose.connection.on('connected', () => { connected = true; console.log('MongoDB connected') });
mongoose.connection.on('open', () => console.log('MongoDB open'));
mongoose.connection.on('disconnected', () => { connected = false; console.log('Mongo DB disconnected') });
mongoose.connection.on('reconnected', () => console.log('Mongo DB reconnected'));
mongoose.connection.on('disconnecting', () => console.log('Mongo DB disconnecting'));
mongoose.connection.on('close', () => console.log('Mongo DB close'));

//connect db:
exports.connectToDatabase = async () => {
    console.log('Mongoose state: ', mongoose.connection.readyState);
    let result = {};
    try {
        await mongoose.connect(url);
        result = { result: 'connected', details: `Connected to database at ${url}` }
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
        result = { result: 'disconnected', details: `Disconnected from database at ${url}` }
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

    try {
        const user = await User.register(new User({ username, email, displayname, notes }), password)
        result = { result: 'success', details: 'Successfully registered user ' + user.username };
    } catch (err) {
        result = handleError(err, 'dbHandler/createNewUser');
    } finally {
        return result;
    };

};
//Delete user:
exports.deleteUser = async (userInfo, options = {}) => {
    const { _id, username, email } = userInfo;
    if (!username && !_id && !email) return handleError({ name: 'NoUserName' }, 'dbHandler/deleteUser');
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
    try {
        const res = await User.findOneAndDelete(searchObj);
        result = res ?
            { result: 'success', details: username + ' deleted' }
            :
            handleError({ name: 'UserDoesntExistsError' }, 'dbHandler/deleteUser');

    } catch (err) {
        result = handleError(err, 'dbHandler/deleteUser');
    } finally {
        const allUsers = await User.find();
        console.log('\n***\nHere are your updated users:\n', allUsers);
        return result;
    };
};
//changePassword:
//...code here
//editUser
//...code here


//-----------------
//Settings handlers
//-----------------

//Add settings
exports.createNewSettings = async (settingsInfo) => {
    const { _id, ...rest } = settingsInfo;
    if (!_id || !settingsInfo || (settingsInfo instanceof Object !== true)) return handleError({ name: 'InvalidDataError' }, 'dbHandler/createNewSettings');

    let result = {};
    try {
        const user = await UserSetting.findOne({ userId: _id })
        if (!user) {
            const res = await UserSetting.create({ ...rest });
            result = { result: 'success', data: res, details: 'created new user settings for ' + username };
        } else {
            result = handleError({ name: 'UserExistsError' }, 'dbHandler/createNewSettings');
        }

    } catch (err) {
        console.log('\nError creating new user settings: ');
        result = handleError(err, 'dbHandler/createNewSettings');
        // const errMsg = `${e}`;
        // if (errMsg.startsWith(DUPLICATE_USER_MSG)) {
        //     console.log('SETTINGS FOR THAT USER ALREADY EXIST');
        //     result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: 'user already exists' }
        // } else {
        //     console.log(e)
        //     result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: errMsg }
        // };

    } finally {
        const allUsers = await UserSetting.find();
        console.log('\n***\nHere are your settings:\n', allUsers);
        return result;
    };
};
//Update Settings:
exports.updateSettings = async (settingsInfo) => {
    const { _id, ...rest } = settingsInfo;
    if (!settingsInfo || !_id || (settingsInfo instanceof Object !== true)) return handleError({ name: 'InvalidDataError' }, 'dbHandler/updateSettings');
    let result = {};
    try {
        const res = await UserSetting.findOneAndUpdate({ userId: _id }, { ...rest }, { new: true });
        console.log('\n\n\n\n\**************Update res: ', res);
        result = res ?
            { result: 'success', data: res, details: 'Settings updated' }
            :
            createNewSettings(settingsInfo);

    } catch (err) {
        result = handleError(err, 'dbHandler/updateSettings');

    } finally {
        const allUsers = await UserSetting.find();
        console.log('\n***\nHere are your updated settings:\n', allUsers);
        return result;
    };

};
//Delete Settings:
exports.deleteSettings = async (settingsInfo) => {
    const { _id } = settingsInfo;
    if (!_id) return handleError({ name: 'InvalidDataError' }, 'dbHandler/deleteSettings');
    let result = {};
    try {
        const res = await UserSetting.findOneAndDelete({ userId: _id });
        result = res ?
            { result: 'success', details: username + ' settings deleted' }
            :
            handleError({name:'UserDoesntExistsError'},'dbHandler/deleteSettings');

    } catch (err) {
        result = handleError(err, 'dbHandler/deleteSettings');

    } finally {
        const allUsers = await UserSetting.find();
        console.log('\n***\nHere are your updated users:\n', allUsers);
        return result;
    };

};
//Get Settings:
exports.getSettings = async (userInfo) => {
    const { _id } = userInfo;
    if (!_id) return handleError({ name: 'InvalidDataError' }, 'dbHandler/getSettings');
    let result = {};
    try {
        const res = await UserSetting.findOne({ userId: _id });
        if (res) {
            console.log(username + 'found');
            result = { result: 'success', data: res, details: username + ' validated' }
        } else {
            result = handleError('UserDoesntExistsError','dbHandler/getSettings')
        };

    } catch (err) {
        result = handleError(err,'dbHandler/getSettings');

    } finally {
        return result;
    };

};