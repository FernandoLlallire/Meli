const redis = require('../config/redis');
const constants = require('../constants');

exports.getClientRedisCache = redis.redisCache;
exports.getClientRedisLogs = redis.redisLogs;
exports.sendToRedis = (req, redisContex, keyValue, timeInMillis) => {
  redisContex.zadd([keyValue, timeInMillis || Date.now(), `${req.ip.replace('::ffff:', '')}:${req.originalUrl}:${timeInMillis || Date.now()}`])
}
