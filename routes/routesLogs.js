const redisMiddleware = require('../middleware/redisMiddleware');
const {keyLogsByDay, keyIpBanByDay, keyIpBanByMinute, quotaPerDay, quotaPerMinute, milisInDay,
  milisInMinute, sortedSetDelimitator, scorePositionInString, ipPositionInString, urlPositionInString} = require('../constants');

function printValues(req,res) {
  res.status(200).json({logs: req[keyLogsByDay], banPerDay: req[keyIpBanByDay], banPerMinute: req[keyIpBanByMinute]});
}

function printValuesByIP(req,res){
  let logsByDay = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator));
  let onlyIp = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator)[ipPositionInString]);
  let onlyIpFiltered = onlyIp.filter( function (value, index, array) {return array.indexOf(value) === index;} )
  let result = {};
  for(ip of onlyIpFiltered){
    quantityByIp = logsByDay.filter(data => data[ipPositionInString] === ip).length;
    result[ip] = quantityByIp;
  }
  res.status(200).json(result);
}

function printValuesByRoute(req,res){
  let logsByDay = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator));
  let onlyUrl = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator)[urlPositionInString]);
  let onlyUrlFiltered = onlyUrl.filter( function (value, index, array) {return array.indexOf(value) === index;} )
  let result = {};
  for(url of onlyUrlFiltered){
    quantityByUrl = logsByDay.filter(data => data[urlPositionInString] === url).length;
    result[url] = quantityByUrl;
  }
  res.status(200).json(result);
}

function printValuesByRouteAndIp(req,res){
  let logsByDay = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator));
  let onlyIp = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator)[ipPositionInString]);
  let onlyIpFiltered = onlyIp.filter( function (value, index, array) {return array.indexOf(value) === index;} )
  let onlyUrl = req[keyLogsByDay].map(data => data[1].split(sortedSetDelimitator)[urlPositionInString]);
  let onlyUrlFiltered = onlyUrl.filter( function (value, index, array) {return array.indexOf(value) === index;} )
  let result = {};
  for(ip of onlyIpFiltered){
    arrayByIp = logsByDay.filter(data => data[ipPositionInString] === ip);
    for(url of onlyUrlFiltered){
      quantityByUrl = arrayByIp.filter(data => data[urlPositionInString] === url).length;
      result[`${ip}${url}`] = quantityByUrl;
    }
  }
  res.status(200).json(result);
}

module.exports = function(redisLogs, redisCache) {
  const router = require('express').Router();
  router.get('/', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValues);
  router.get('/allLogs', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValues);
  router.get('/logsByIp', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValuesByIP);
  router.get('/logsByUrl', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValuesByRoute);
  router.get('/logsByUrlAndIp', redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), printValuesByRouteAndIp);
  router.get('/*',redisMiddleware.clearByTimeForLogs.bind(redisLogs), redisMiddleware.getAllDataFromLogs.bind(redisLogs), redisMiddleware.checkQuotaForLogs.bind(redisLogs), redisMiddleware.getMeliData.bind(redisCache), redisMiddleware.updateLogs.bind(redisLogs));
  //https://api.mercadolibre.com/categories/MLA30802 a la MLA30835
  return router;
}
