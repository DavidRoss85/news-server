const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homepageSchema = new Schema(
    {
        id: {
            type: Number,
            required: true,
        },
        title: String,
        tileType: String,
        row: { type: Number, required: true, default: 1, },
        numArticles: Number,
        sizing: Schema.Types.Mixed,
        innerSizing: Schema.Types.Mixed,
        componentAttribute: Schema.Types.Mixed,
        search: Schema.Types.Mixed,
        style: Schema.Types.Mixed,
    }
)

const preferenceSchema = new Schema(
    {
        region: {
            type: String,
            default: '',
        },
        homepage: [homepageSchema],
    }
)

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        displayname: {
            type: String,
            required: true,
            default: 'Welcome'
        },
        avatar: {
            type: String,
        },
        preferences: preferenceSchema,
    },
    {
        timestamps: true,
    }
);

const UserSetting = mongoose.model('UserSetting', userSchema);
module.exports = UserSetting;