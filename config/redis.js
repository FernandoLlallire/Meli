const redis = require('redis');
const util = require('util');
const constants = require('../constants');
exports.redisCache = _ => redis.createClient({host: constants.containerRedisCache, retry_strategy:(options)=>{console.log(`There was a problem trying to connect to Redis_Cache. Worker ${process.pid}`); new Error('The server refused the connection')}});
exports.redisLogs = _ => redis.createClient({host: constants.containerRedisLogs, retry_strategy:(options)=>{console.log(`There was a problem trying to connect to Redis_Registers. Worker ${process.pid}`); new Error('The server refused the connection')}});
