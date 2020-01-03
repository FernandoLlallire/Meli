module.exports = Object.freeze({
  milisInMinute : 60000,
  milisInDay : 86400000,
  quotaPerDay : 4,
  quotaPerMinute : 2,
  containerRedisCache : 'redis_cache',
  containerRedisLogs : 'redis_logs',
  keyLogsByDay : 'logsByDay',
  keyIpBanByDay : 'logsBanByDay',
  keyIpBanByMinute :'logsBanByMinute',
  sortedSetDelimitator: ':'
})
// TODO: Add order for values that i'll use in the string for redis
