const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema(
    {
        displayname: {
            type: String,
            required: true,
            default: 'Welcome',
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        notes: {
            type: String,
        },
        admin: {
            type: Boolean,
            required: true,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
