const DUPLICATE_USER_MSG = 'MongoServerError: E11000 duplicate key error collection: newsFeedData.users index: username';
const url = 'mongodb://127.0.0.1:27017/newsFeedData';
const mongoose = require('mongoose');
const User = require('./models/userModel');
const handleError = require('../public/javascripts/handleError')

//Event handlers:
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('open', () => console.log('MongoDB open'));
mongoose.connection.on('disconnected', () => console.log('Mongo DB disconnected'));
mongoose.connection.on('reconnected', () => console.log('Mongo DB reconnected'));
mongoose.connection.on('disconnecting', () => console.log('Mongo DB disconnecting'));
mongoose.connection.on('close', () => console.log('Mongo DB close'));
mongoose.connection.on('error',(e)=>{
    // console.log('\n\n>>>>>>>>>>>>>>\nTest Error:\nreason:',e.reason);
    // console.log('name:', e.name);
    // console.log('caller',e.caller)
    // console.log('>>>>>>>>>>>>>>>\n\n\n\n')

})


exports.testConnection = async () => {
    let result = {};
    try {
        await mongoose.connect(url);
        result = { result: 'success', details: 'connection OK' };

    } catch (e) {
        console.log(e);
        result = { result: 'error', details: 'Bad connnection: ' + e };

    } finally {
        await mongoose.connection.close();
        return result;

    };

};

exports.createNewUser = async (userInfo) => {
    const { username, password } = userInfo;
    if (!username || !password) return { result: 'error', details: 'must provide user info' };

    //NOT SECURE
    let result = {};
    try {
        await mongoose.connect(url);
        await User.create({
            username: username,
            password: password,
        });
        result = { result: 'success', details: 'created new user ' + username };

    } catch (e) {
        console.log('\nError creating new user: ');
        const errMsg = `${e}`;
        if (errMsg.startsWith(DUPLICATE_USER_MSG)) {
            console.log('USER ALREADY EXISTS');
            result = { result: 'error', details: 'user already exists' }
        } else {
            result = { result: 'error', details: errMsg }
        };

    } finally {
        const allUsers = await User.find();
        console.log('\n***\nHere are your users:\n', allUsers);
        mongoose.connection.close();
        return result;

    };

};

exports.findAll = async () => {
    let result = {}
    try {
        await mongoose.connect(url);
        result = await User.find();
        console.log('\n***\nHere are your users:\n', result);

    } catch (e) {
        console.log('Error performing search: ', e);
        result = { result: 'error', details: e };

    } finally {
        await mongoose.connection.close();
        return result;

    };

};

exports.changePassword = async (userInfo) => {
    const { username, password } = userInfo;
    if (!username || !password) return { result: 'error', details: 'username or password not specified' };

    let result = {};
    try {
        await mongoose.connect(url);
        const res = await User.findOneAndUpdate({ username: username }, { password: password },{new:true});
        result = res ?
            { result: 'success', details: 'Password updated' }
            :
            (()=>{
                console.log('User not found in database')
                return{ result: 'error', details: 'Unable to update password' };
            })();

    } catch (e) {
        console.log('Error updating password: ', e);
        result = { result: 'error', details: e };

    } finally {
        const allUsers = await User.find();
        console.log('\n***\nHere are your updated users:\n', allUsers);
        await mongoose.connection.close();
        return result;
    };

};

exports.changeUsername = async (userInfo) => {
    const { username, newUsername } = userInfo;
    if (!username || !newUsername) return { result: 'error', details: 'user info not specified' };

    let result = {};
    try {
        await mongoose.connect(url);
        const res = await User.findOneAndUpdate({ username: username }, { username: newUsername },{new:true});
        result = res ?
            { result: 'success', details: 'Password updated' }
            :
            { result: 'error', details: 'Could not locate user' };

    } catch (e) {
        console.log('Error updating username: ', e);
        result = { result: 'error', details: e };

    } finally {
        const allUsers = await User.find();
        console.log('\n***\nHere are your updated users:\n', allUsers);
        await mongoose.connection.close();
        return result;
    };

};

exports.deleteUser = async (userInfo) => {
    const { username } = userInfo;
    if (!username) return { result: 'error', details: 'user info not specified' };
    let result = {};
    try {
        await mongoose.connect(url);
        const res = await User.findOneAndDelete({ username: username });
        result = res ?
            { result: 'success', details: username + ' deleted' }
            :
            { result: 'error', details: 'Could not locate user'+ username };

    } catch (e) {
        console.log('Error deleting user: ', e);
        result = { result: 'error', details: e };

    } finally {
        const allUsers = await User.find();
        console.log('\n***\nHere are your updated users:\n', allUsers);
        await mongoose.connection.close();
        return result;
    };

};

exports.validateUser = async (userInfo) => {
    const { username, password } = userInfo;
    if (!username || !password) return { result: 'error', details: 'user information not specified' };
    let result = {};
    //default server fail code:
    const server = {
        code: 403,
        category: 'Failed',
        message: 'Invalid username or password',
    }
    try {
        await mongoose.connect(url);
        const res = await User.findOne({ username: username });
        if (res) {
            console.log(username + 'found');
            res.password === password ?
                result = { result: 'success', validated: true, details: username + ' validated', username }
                :
                result = { result: 'failed', details: 'invalid password', server: {...server} }
        } else {
            result = { result: 'failed', details: 'invalid username',server:{...server} };
        };

    } catch (e) {
        result = handleError(e,'validateUser',{message: 'Error validating user'})
        // console.log('Error locating user: ' + username, e);
        // result = { result: 'failed', details: 'invalid username or password' };

    } finally {
        await mongoose.connection.close();
        return result;
    };

};
