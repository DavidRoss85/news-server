const cache = require('memory-cache');
// const { buildNewsURL } = require('./utils')
const fs = require('node:fs');
const os = require('node:os');
const path = require('path');
const handleError = require('./handleError');
const cacheStore = path.join(os.tmpdir(), '/newsCache.json');
const cacheLog = path.join(os.tmpdir(), '/newsCacheArchive.txt');

module.exports.checkCache = async (key) => {
    const cacheItem = await cache.get(key);
    try {
        return cacheItem;
    } catch (err) {
        console.log('Error reading news cache: ', err);
    };

};

module.exports.writeCache = async (key, data) => {
    try {
        // key='test'; data={random: 'information'}
        await cache.put(key, data, (86400000 * 2));//TWO DAYS
    } catch (err) {
        console.log('Error occurred writing to cache: ', err);
    };

};


module.exports.readCache = async (key) => {
    try {
        return { result: cache.exportJson() };
    } catch (err) {
        return { error: 'An error occured reading cache: ', err };
    };

};

//Save cache to file in case of server restart
module.exports.saveCache = async () => {
    // const jsonCache =
    fs.writeFile(cacheStore, cache.exportJson(), err => {
        if (err) {
            console.log('Error writing cache file to drive');
        }
    })

};

//Import old cache from file in case of server restart
module.exports.importCache = async (saveOld = false) => {

    try {
        const importedData = fs.readFileSync(cacheStore, 'utf-8');

        // saveOld = true;
        //Save the old cache in an archive file
        if (saveOld) {
            const appendLog = '\n\n>\n>\nDate/Time: ' + Date.now() + '\n\n' + importedData + '\n';
            fs.appendFile(cacheLog, appendLog, err => {
                if (err) {
                    console.log('Error saving old cache: ', err)
                }
            })
        }
        console.log('\nImported news cache:')
        // const dummyData = '{"Fake":{"value":"JSON Data", "expire":1713324245290}}'
        await cache.importJson(importedData);
        // console.log('Whats in the cache:', cache.exportJson())

    } catch (err) {
        if (err.code === 'ENOENT') {
            //File does not exist:
            fs.writeFile(cacheLog, '{}', err => {
                if (err) {
                    handleError(err, 'cacheHandler/importCache');
                };
            });
        } else {
            handleError(err, 'cacheHandler/importCache');
        }
    }
};

