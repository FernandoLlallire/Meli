const redisMiddleware = require('../middleware/redisMiddleware');
const {keyLogsByDay, keyIpBanByDay, keyIpBanByMinute, quotaPerDay, quotaPerMinute, milisInDay,
  milisInMinute, sortedSetDelimitator, scorePositionInString, ipPositionInString, urlPositionInString} = require('../constants');

function printValues(req,res) {
  res.status(200).json({logs: req[keyLogsByDay], banPerDay: req[keyIpBanByDay], banPerMinute: req[keyIpBanByMinute]});
}


module.exports = function(redisLogs, redisCache) {
  const router = require('express').Router();
  router.get('/', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValues);
  router.get('/allLogs', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValues);
  router.get('/*',redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), redisMiddleware.checkQuotaForLogs.bind(redisLogs), redisMiddleware.getMeliData.bind(redisCache), redisMiddleware.updateLogs.bind(redisLogs));
  //https://api.mercadolibre.com/categories/MLA30802 a la MLA30835
  return router;
}
