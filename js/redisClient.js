//This module is used to cache results
const { ONE_DAY, CACHE_ON } = require('./DEFAULTS');
const BAN_KEY = 'BANNED_TIME';
const handleError = require('./handleError');

const { createClient } = require('redis');
const client = createClient({
    // username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_DEFAULT_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', (err) => { handleError(err, 'redisClient') });
client.on('ready',()=>{ console.log('Connected to Redis host');});
client.on('end',()=>{ console.log('Connection to Redis ended');});

module.exports.connectToCache = async () => {
    if(!CACHE_ON){
        return;
    };
    try{
        await client.connect();
    }catch(err){
        handleError(err,'redisClient/connectToCache');
        console.log('Failed to connect to Redis host...')
    }
}

module.exports.checkCache = async (key) => {
    if(!CACHE_ON){
        return null;
    };
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
    if(!CACHE_ON){
        return;
    };
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
    if(!CACHE_ON){
        return 'none';
    };
    try {
        const banTime = await client.get(BAN_KEY);
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
    };
};

module.exports.setLimit = async () => {
    if(!CACHE_ON){
        return;
    };
    try {
        await client.set(BAN_KEY, Date.now());
        console.log('**Set Limit success**')
    } catch (err) {
        handleError(err, 'redisClient/setLimit')
    };
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
