const redis = require('../config/redis');
exports.getClientRedisCache = redis.redisCache;
exports.getClientRedisLogs = redis.redisLogs;
exports.sendLog = (req, redisContex) => {
  redisContex.zadd(['logsByMinute', Date.now(), `${req.ip.replace('::ffff:', '')}:${req.originalUrl}:${Date.now()}`])
  redisContex.zadd(['logsByDay', Date.now(), `${req.ip.replace('::ffff:', '')}:${req.originalUrl}:${Date.now()}`])
}
