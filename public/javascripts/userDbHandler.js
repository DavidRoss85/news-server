const url = 'mongodb://127.0.0.1:27017/newsFeedData';
const mongoose = require('mongoose');
const User = require('./dbModels/userModel');

//Event handlers:
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('open', () => console.log('MongoDB open'));
mongoose.connection.on('disconnected', () => console.log('Mongo DB disconnected'));
mongoose.connection.on('reconnected', () => console.log('Mongo DB reconnected'));
mongoose.connection.on('disconnecting', () => console.log('Mongo DB disconnecting'));
mongoose.connection.on('close', () => console.log('Mongo DB close'));


exports.testConnection = async ()=>{
    await mongoose.connect(url);
    await mongoose.connection.close();
};

exports.testCreate = async ()=>{
    await mongoose.connect(url);
    try{
        await User.create({
            username: 'user',
            password: 'Longpassword'
        });
    }catch(e){
        console.log('\nError creating new user: ', e)
    }

    const allUsers = await User.find();
    console.log('\n***\nHere are your users:\n', allUsers);

    mongoose.connection.close();
};

exports.testFind = async ()=>{
    await mongoose.connect(url);

    const allUsers = await User.find();
    console.log('\n***\nHere are your users:\n', allUsers);

    await mongoose.connection.close();
};

exports.testEdit = async (username)=>{
    await mongoose.connect(url);

    try{
        const currentUser = await User.findOne({username: username});
        await User.findOneAndUpdate({username: username}, {password: currentUser.password + ' (updated)'});
    }catch(e){
        console.log('Error updating document: ', e)
    }

    const allUsers = await User.find();
    console.log('\n***\nHere are your updated users:\n', allUsers);

    await mongoose.connection.close();
};

exports.testDelete = async (username)=>{
    await mongoose.connect(url);

    await User.findOneAndDelete({username: username});

    const allUsers = await User.find();
    console.log('\n***\nHere are your updated users:\n', allUsers);

    await mongoose.connection.close();
};