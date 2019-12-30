const redis = require('redis');
const util = require('util');

exports.redisCache = _ => redis.createClient({host: 'redis_cache', retry_strategy:(options)=>{console.log(`There was a problem trying to connect to Redis_Cache. Worker ${process.pid}`); new Error('The server refused the connection')}});
exports.redisLogs = _ => redis.createClient({host: 'redis_logs', retry_strategy:(options)=>{console.log(`There was a problem trying to connect to Redis_Registers. Worker ${process.pid}`); new Error('The server refused the connection')}});
