const url = process.env.MONGO_LOCAL_URL //'mongodb://127.0.0.1:27017/newsFeedData';
const mongoose = require('mongoose');
const passport = require('passport');
const authenticate = require('../authenticate')
const User = require('./models/userModel');
const UserSetting = require('./models/userSettingModel');
const handleError = require('../js/handleError');

//Event handlers:
mongoose.connection.on('connected', () => { connected = true; console.log('\n**********\nMongoDB connected') });
mongoose.connection.on('open', () => console.log('MongoDB connection open\n**********'));
mongoose.connection.on('disconnected', () => { connected = false; console.log('\n***Mongo DB disconnected***\n') });
mongoose.connection.on('reconnected', () => console.log('\n---Mongo DB reconnected---\n'));
mongoose.connection.on('disconnecting', () => console.log('\n>>>Mongo DB disconnecting<<<\n'));
mongoose.connection.on('close', () => console.log('\nxxx Mongo DB connection closed xxx\n'));

//sleep timer
const sleep = async (ms) => {
    return new Promise((resolve) => { setTimeout(resolve, ms) })
}




//connect db:
exports.connectToDatabase = async () => {
    console.log('Mongoose state: ', mongoose.connection.readyState);
    let result = {};
    try {
        if(!mongoose.connection.readyState){
            mongoose.connect(url);
            result = { result: 'connected', details: `Connected to database at ${url}` }
        }else if(mongoose.connection.readyState===3){
            await sleep(5000);
            mongoose.connect(url);
            result = { result: 'connected', details: `Connected to database at ${url}` }
        } else{

        }
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
        result = { result: 'success', code: 200, category:'Register',message:'Registration Successful for '+ user.username, details: 'Successfully registered user ' + user.username };
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
    try {
        const res = await User.findOneAndDelete(searchObj);
        result = res ?
            { result: 'success', code: 200, category:'Delete',message:'User ' + res.username + ' deleted', details: res.username + ' deleted' }
            :
            handleError('UserDoesntExistsError', 'dbHandler/deleteUser');

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
    if (!_id || !settingsInfo || (settingsInfo instanceof Object !== true)) return handleError('InvalidDataError', 'dbHandler/createNewSettings');

    let result = {};
    try {
        const user = await UserSetting.findOne({ userId: _id })
        if (!user) {
            const res = await UserSetting.create({ userId: _id, ...rest });
            result = { result: 'success',code: 200, category:'Settings',message:'New settings created ', data: res, details: 'created new user settings for ' + _id };
        } else {
            result = handleError('UserExistsError', 'dbHandler/createNewSettings');
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
    if (!settingsInfo || !_id || (settingsInfo instanceof Object !== true)) return handleError('InvalidDataError', 'dbHandler/updateSettings');
    let result = {};
    try {
        const res = await UserSetting.findOneAndUpdate({ userId: _id }, { ...rest }, { new: true });
        console.log('\n\n\n\n\**************Update res: ', res);
        result = res ?
            { result: 'success',code: 200, category:'Settings',message:'Settings updated', data: res, details: 'Settings updated' }
            :
            this.createNewSettings(settingsInfo);

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
    if (!_id) return handleError('InvalidDataError', 'dbHandler/deleteSettings');
    let result = {};
    try {
        const res = await UserSetting.findOneAndDelete({ userId: _id });
        result = res ?
            { result: 'success',code: 200, category:'Settings',message:'Settings deleted ', details: _id + ' settings deleted' }
            :
            handleError('UserDoesntExistsError', 'dbHandler/deleteSettings');

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
    if (!_id) return handleError('InvalidDataError', 'dbHandler/getSettings');
    let result = {};
    try {
        const res = await UserSetting.findOne({ userId: _id });
        if (res) {
            result = { result: 'success',code: 200, category:'Settings',message:'Settings retrieved', data: res, details: res.username + ' validated' }
        } else {
            result = handleError('UserDoesntExistsError', 'dbHandler/getSettings')
        };

    } catch (err) {
        result = handleError(err, 'dbHandler/getSettings');

    } finally {
        return result;
    };

};