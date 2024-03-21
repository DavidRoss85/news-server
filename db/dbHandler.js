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
    if (!username) return handleError({ name: 'NoUserName' }, 'dbHandler/createNewUser', { consoleShow: false });
    if (!password) return handleError({ name: 'NoPassword' }, 'dbHandler/createNewUser', { consoleShow: false });
    if (!email) return handleError({ name: 'NoEmail' }, 'dbHandler/createNewUser', { consoleShow: false });

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
    if (!username && !_id && !email) return handleError({name: 'NoUserName'},'dbHandler/deleteUser');
    const {findBy = 'id'} = options;
    const searchObj = {}
    switch(findBy){
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
            handleError({name:'UserDoesntExistsError'},'dbHandler/deleteUser');

    } catch (err) {
        result = handleError(err,'dbHandler/deleteUser');
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


