//This module is used to cache results
const { CACHE_BAN_TIME, ONE_DAY } = require('./DEFAULTS');
const handleError = require('./handleError');

const { createClient } = require('redis');
const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', (err) => { handleError(err, 'redisClient') });

module.exports.connectToCache = async () => {
    try{
        await client.connect();
        console.log('Connected to Redis host');
    }catch(err){
        handleError(err,'redisClient/connectToCache');
        console.log('Failed to connect to Redis host...')
    }
}

module.exports.checkCache = async (key) => {
    try {
        let cacheItem = await client.get(key);
        cacheItem = cacheItem ? await JSON.parse(cacheItem) : null;
        return cacheItem;
    } catch (err) {
        handleError(err, 'redisClient/checkCache');
        return null
    };

};

module.exports.writeCache = async (key, data) => {
    const stringData = JSON.stringify(data);
    try {
        // key='test'; data="{random: 'information'}"
        await client.set(key, stringData);
    } catch (err) {
        console.log('Error occurred writing to cache:');
        handleError(err, 'redisClient/writeCache');
    };

};

module.exports.checkLimit = async () => {
    try {
        const banTime = await client.get(CACHE_BAN_TIME);
        const timeLeft = Date.now() - banTime;

        // console.log('\nThis is the fetched banTime Value: ', banTime);
        // console.log('\nThis is the Time Left: ', timeLeft);

        if (timeLeft > ONE_DAY) {
            return 'none';
        }else{
            return timeLeft
        }

    } catch (err) {
        handleError(err, 'redisClient/checkLimit');
        return null
    }
};

module.exports.setLimit = async () => {
    try {
        await client.set(CACHE_BAN_TIME, Date.now());
        console.log('**Set Limit success**')
    } catch (err) {
        handleError(err, 'redisClient/setLimit')
    }
};


// // Set a value in the cache
// client.set('myKey', 'myValue');

// // Retrieve a value from the cache
// client.get('myKey', (err, reply) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log('Cached value:', reply);
// });
