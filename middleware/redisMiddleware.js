const constants = require('../constants');
const redisController = require('../controllers/redisController');

const chunk = (arr, size) =>
Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
  arr.slice(i * size, i * size + size).reverse()//first element of the vector is the score and the second the value
);

exports.clearByTime = async function(req, res, next, timeThreshold) {
  let currentTime = Date.now();
  let limit = currentTime - timeThreshold;
  const {ok, error, data} = await redisController.cleanSortedSet.bind(this)(key, limit);
  if (ok) {
    req.currentTime = currentTime;
    next();
  } else {
    console.log(`There was a problem cleaning ${key} in ${this.clientInfo} client`, error);
    res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
  }
}

exports.getAllLogs = async function (req, res, next){
  const {ok, error, data} = await redisControler.getRangeByScore.bind(this)(constans.keyLogsByDay);
  if (ok) {
    req.allLogs = data.length == 0 ? [] : chunk(data, 2);
    next();
  } else {
    console.log(`There was a problem getting logs from ${key} in ${this.clientInfo} client`, error);
    res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
  }
}
/*[[score=Date.now()],[score=Date.now(): `${req.ip.replace('::ffff:', '')}:${req.originalUrl}`]] for logs*/
/*[[score=Date.now()],[score=Date.now(): `${req.ip.replace('::ffff:', '')}`]] for bans*/
exports.checkQuota = async function (req, res, next, keyIpBan)  {
  let isCheckedByDay = keyIpBan === constants.keyIpBanByDay;
  let keyToCheck = isCheckedByDay ? constants.keyIpBanByDay : constants.keyIpBanByMinute;
  let quota = isCheckedByDay ? constans.quotaPerDay : constants.quotaPerMinute;
  let milis = isCheckedByDay ? constans.milisInDay : constans.milisInMinute;
  const {ok, error, data} = await redisControler.getRangeByScore.bind(this)(keyToCheck);
  if (ok) {
    let allDataFromIpBan = data.length === 0 ? [] : chunk(data, 2);//[score, "score:ip"]
    let ip = req.ip.replace('::ffff:', '');
    let vectorIpBan = allDataFromIpBan.filter((vector) => vector[1].split(constants.sortedSetDelimitator)[1] === ip);
    if(vectorIpBan.length === 0) {
      if (req.allLogs === 0) {
        next();
      } else {
        let callsByCurrentIp = req.allLogs.filter((vector) => vector[1].split(constants.sortedSetDelimitator)[1] === ip && (isCheckedByDay ? true : Number(vector[0]) > (Number(req.currentTime)-Number(milis))) ).length;
        if (quota > callsByCurrentIp) {
          next();
        } else {
          const {ok: okSend, error: errorSend, data: dataSend} = await redisControler.sendToSortedSet(keyToCheck, req.currentTime, ip);
          if (okSend) {
            res.status(429).send({message: `quota ratio per day exceeded. The ip will be block until ${Date(Number(req.currentTime) + Number(milis))} `, error: 'Too Many Requests', status: 429, cause: []});
          } else {
            res.status(500).send({message: errorSend.message, error:errorSend.name, status: 500, cause: errorSend.stack});
          }
        }
      }
    } else {
      res.status(429).send({message: `quota ratio per day exceeded. The ip will be block until ${Date(Number(vectorIpBan.split(constants.sortedSetDelimitator)[0]) + Number(milis))} `, error: 'Too Many Requests', status: 429, cause: []})
    }
  } else {
    res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
  }
}
