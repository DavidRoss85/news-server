const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema(
    {
        displayname: {
            type: String,
            required: true,
            default: 'Welcome'
        },
        notes: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
