//Testing using MongoDB for caching instead of Redis.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsCacheSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        data: Schema.Types.Mixed,
    },
    {
        timestamps: true,
    },
);


const NewsCacheEntry = mongoose.model('NewsCacheEntry', newsCacheSchema);
module.exports = NewsCacheEntry;