const url = 'mongodb://127.0.0.1:27017/newsFeedData';
const mongoose = require('mongoose');
const User = require('./dbModels/userModel');
const UserSetting = require('./dbModels/userSettingModel');

const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

exports.testConnection = async ()=>{
    await connect();
    console.log('Connected to server');
    mongoose.connection.close();
}