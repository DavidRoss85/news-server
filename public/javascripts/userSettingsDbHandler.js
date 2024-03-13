const DUPLICATE_USER_MSG = 'MongoServerError: E11000 duplicate key error collection: newsFeedData.users index: username';
const url = 'mongodb://127.0.0.1:27017/newsFeedData';
const DEFAULTS = require('./DEFAULTS');
const mongoose = require('mongoose');
const UserSetting = require('./dbModels/userSettingModel');
let connected = false;
//Event handlers:
mongoose.connection.on('connected', () => { connected = true; console.log('MongoDB connected') });
mongoose.connection.on('open', () => console.log('MongoDB open'));
mongoose.connection.on('disconnected', () => { connected = false; console.log('Mongo DB disconnected') });
mongoose.connection.on('reconnected', () => console.log('Mongo DB reconnected'));
mongoose.connection.on('disconnecting', () => console.log('Mongo DB disconnecting'));
mongoose.connection.on('close', () => console.log('Mongo DB close'));


exports.testConnection = async () => {
    await mongoose.connect(url);
    await mongoose.connection.close();
};

exports.addSettings = async (settingsInfo) => {
    await mongoose.connect(url);
    try {
        await UserSetting.create(settingsInfo);
    } catch (e) {
        console.log('\nError creating new user: ', e)
    }

    const allUsers = await UserSetting.find();
    console.log('\n***\nHere are your users:\n', allUsers);

    mongoose.connection.close();
};

exports.testFind = async () => {
    await mongoose.connect(url);

    const allUsers = await UserSetting.find();
    console.log('\n***\nHere are your users:\n', allUsers);

    await mongoose.connection.close();
    return allUsers;
};

exports.testEdit = async (username) => {
    await mongoose.connect(url);

    try {
        await UserSetting.findOneAndUpdate(
            { username: username },
            { username: `${username}2` },
            { new: true }
        );
    } catch (e) {
        console.log('Error updating document: ', e)
    }

    const allUsers = await UserSetting.find();
    console.log('\n***\nHere are your updated users:\n', allUsers);

    await mongoose.connection.close();
};

exports.testDelete = async (username) => {
    await mongoose.connect(url);

    // await UserSetting.findOneAndDelete({ username: username });
    UserSetting.collection.drop()
    const allUsers = await UserSetting.find();
    console.log('\n***\nHere are your updated users:\n', allUsers);

    await mongoose.connection.close();
};

exports.getSettings = async (userInfo) => {
    const { username } = userInfo;
    if (!username) return { result: 'error', details: 'user information not specified' };
    let result = {};
    try {
        await mongoose.connect(url);
        const res = await UserSetting.findOne({ username: username });
        if (res) {
            console.log(username + 'found');
            result = { result: 'success', data: res, details: username + ' validated' }
        } else {
            result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: 'user not located' };
        };

    } catch (e) {
        console.log('Error locating user: ' + username, e);
        result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: e };

    } finally {
        await mongoose.connection.close();
        return result;
    };

};

exports.createNewSettings = async (settingsInfo) => {
    const { username } = settingsInfo;
    if (!username || !settingsInfo || (settingsInfo instanceof Object !== true)) return { result: 'error', details: 'invalid data' };

    //NOT SECURE
    let result = {};
    try {
        await mongoose.connect(url);
        const res = await UserSetting.create(settingsInfo);
        result = { result: 'success', data: res, details: 'created new user settings for ' + username };

    } catch (e) {
        console.log('\nError creating new user settings: ');
        const errMsg = `${e}`;
        if (errMsg.startsWith(DUPLICATE_USER_MSG)) {
            console.log('SETTINGS FOR THAT USER ALREADY EXIST');
            result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: 'user already exists' }
        } else {
            console.log(e)
            result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: errMsg }
        };

    } finally {
        const allUsers = await UserSetting.find();
        console.log('\n***\nHere are your settings:\n', allUsers);
        // mongoose.connection.close();
        return result;

    };

};

exports.updateSettings = async (settingsInfo) => {
    const { username } = settingsInfo;
    if (!settingsInfo || !username || (settingsInfo instanceof Object !== true)) return { result: 'error', details: 'invalid data' };
    let result = {};
    try {
        await mongoose.connect(url);
        const res = await UserSetting.findOneAndUpdate({ username: username }, { ...settingsInfo });
        result = res ?
            { result: 'success', data: res, details: 'Settings updated' }
            :
            await (async () => { await mongoose.connection.close(); return this.createNewSettings(settingsInfo) })();

    } catch (e) {
        console.log('Error in updating user Settings: ', e);
        result = { result: 'error', data: DEFAULTS.DEFAULT_USER_SETTINGS, details: e };

    } finally {
        const allUsers = await UserSetting.find();
        console.log('\n***\nHere are your updated settings:\n', allUsers);
        await mongoose.connection.close();
        return result;
    };

};

exports.deleteSettings = async (settingsInfo) => {
    const { username } = settingsInfo;
    if (!username) return { result: 'error', details: 'user info not specified' };
    let result = {};
    try {
        await mongoose.connect(url);
        const res = await UserSetting.findOneAndDelete({ username: username });
        result = res ?
            { result: 'success', details: username + ' settings deleted' }
            :
            { result: 'error', details: 'Could not locate user ' + username };

    } catch (e) {
        console.log('Error deleting user: ', e);
        result = { result: 'error', details: e };

    } finally {
        const allUsers = await UserSetting.find();
        console.log('\n***\nHere are your updated users:\n', allUsers);
        await mongoose.connection.close();
        return result;
    };

};
