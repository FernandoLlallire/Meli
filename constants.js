module.exports = Object.freeze({
  milisInMinute : 60000,
  milisInDay : 86400000,
  milisToExpire: 300000,
  quotaPerDay : 5,
  quotaPerMinute : 2,
  containerRedisCache : 'redis_cache',
  containerRedisLogs : 'redis_logs',
  keyLogsByDay : 'logsByDay',
  keyIpBanByDay : 'logsBanByDay',
  keyIpBanByMinute :'logsBanByMinute',
  routeMeliApi: 'https://api.mercadolibre.com',
  sortedSetDelimitator: ',',
  scorePositionInString: 0,
  ipPositionInString: 1,
  urlPositionInString: 2,
})
/*[score, `${score}:${req.ip.replace('::ffff:', '')}:${req.originalUrl}`] for logs*/
/*[score, `${score}:${req.ip.replace('::ffff:', '')}`] for bans*/
