const constants = require('../constants');
const redisController = require('../controllers/redisControler');

const chunk = (arr, size) =>
Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
  arr.slice(i * size, i * size + size).reverse()
);

exports.checkByDay = (req, res, next, redisContex) => {
  redisContex.zremrangebyscore([constants.keyLogsByDay, 0, Number(req.requestCurrentTime) - Number(constants.milisInDay)]);
  req.requestCurrentTime = Date.now();
  redisContex.zrange(constants.keyLogsByDay, 0, Number(req.requestCurrentTime) - Number(constants.milisInDay), 'WITHSCORES', (err,result) => {
        if(err)
          console.log(err);
        else{
          req.logsByDay = chunk(result,2);
          if(req.logsByDay.length >= constants.quotaPerDay){
            // redisController.sendToRedis(req, redisContex, constants.keyLogsBanByDay, req.requestCurrentTime);
            res.status(429).send("Too Many Request block by one day");
          } else {
            redisController.sendToRedis(req, redisContex, constants.keyLogsByDay, req.requestCurrentTime);
            next();
          }
        }
    })
}

exports.checkByMinute = (req, res, next, redisContex) => {
  req.logsByminute = req.logsByDay.filter((chunk) => Number(chunk[0]) > (Number(req.requestCurrentTime) - Number(constants.milisInMinute)) && chunk[1].split(':')[0]===req.ip.replace('::ffff:', ''))
  if(req.logsByminute.length >= constants.quotaPerMinute){
    redisController.sendToRedis(req, redisContex, constants.keyLogsBanByMinute, req.requestCurrentTime);
    res.status(429).send("Too Many Request block by one minute");
  } else {
    next();
  }
}
