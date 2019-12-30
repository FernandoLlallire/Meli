module.exports = Object.freeze({
  milisInMinute : 60000,
  milisInDay : 86400000,
  quotaPerDay : 4,
  quotaPerMinute : 2,
  containerRedisCache : 'redis_cache',
  containerRedisLogs : 'redis_logs',
  // keyLogsByMinute : 'logsByMinute',
  keyLogsByDay : 'logsByDay',
  keyLogsBanByDay : 'logsBanByDay',
  keyLogsBanByMinute :'logsBanByMinute'
})
