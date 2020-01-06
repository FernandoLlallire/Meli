const {keyLogsByDay, keyIpBanByDay, keyIpBanByMinute, quotaPerDay, quotaPerMinute, milisInDay,
  milisInMinute, sortedSetDelimitator, scorePositionInString, ipPositionInString,
  urlPositionInString, routeMeliApi, milisToExpire} = require('../constants');
const redisController = require('../controllers/redisController');
const fetch = require("node-fetch");

const chunk = (arr, size) =>
Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
  arr.slice(i * size, i * size + size).reverse()//first element of the vector is the score and the second the value
);

exports.clearByTimeForLogs = async function(req, res, next){
  let currentTime = Date.now();
  const {ok, key, error} = await [{key: keyLogsByDay, limit: currentTime-milisInDay}, {key: keyIpBanByMinute, limit: currentTime-milisInMinute}, {key: keyIpBanByDay, limit: currentTime-milisInDay}].reduce(async (accP, cur) => {
    let acc = await accP;
    if(acc.ok){
      const {ok, error, data} = await redisController.cleanSortedSet.bind(this)(cur.key, cur.limit);
      if(!ok){
        return Promise.resolve({ok: false, key: cur.key, error});
      }
    }
    return Promise.resolve(acc);
  },Promise.resolve({ok: true}));
  if(ok){
    req.currentTime = currentTime;
    next();
  }else{
    console.log(`There was a problem cleaning ${key} in ${this.clientInfo} client\n`, error);
    res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
  }
}

exports.getAllDataFromLogs = async function (req, res, next){
  const {ok, key, error} = await [keyLogsByDay, keyIpBanByMinute, keyIpBanByDay].reduce(async(accP, key) => {
    let acc = await accP;
    if(acc.ok){
      const {ok, error, data} = await redisController.getRangeByScore.bind(this)(key);
      if(ok){
        req[key] = data.length ? chunk(data, 2) : [];
      }else{
        return Promise.resolve({ok: false, key, error});
      }
    }
    return Promise.resolve(acc);
  },Promise.resolve({ok: true}));
  if(ok){
    next();
  }else{
    console.log(`There was a problem getting logs from ${key} in ${this.clientInfo} client`, error);
    res.status(500).send({message: error.message, error: error.name, status: 500, cause: error.stack});
  }
}

/*[score, `${score}:${req.ip.replace('::ffff:', '')}:${req.originalUrl}`] for logs*/
/*[score, `${score}:${req.ip.replace('::ffff:', '')}`] for bans*/
exports.checkQuotaForLogs = async function (req, res, next)  {
  let ip = req.ip.replace('::ffff:', '');
  const result = [keyIpBanByDay, keyIpBanByMinute, keyLogsByDay].reduce((acc, key)=>{
    acc[key]  = req[key].length ? req[key].filter((redisVector) => redisVector[1].split(sortedSetDelimitator)[ipPositionInString] === ip) : [];
    // console.log(acc)
    return acc;
  },{ok: true});
  result['logsFilteredByMinute'] = req[keyLogsByDay].filter((redisVector) => Number(redisVector[0]) > (Number(req.currentTime) - Number(milisInMinute)));
  let shouldBanByDay = result[keyLogsByDay].length >= quotaPerDay;
  let shouldBanByMinute = result['logsFilteredByMinute'].length >= quotaPerMinute;
  if(!result[keyIpBanByDay].length && !result[keyIpBanByMinute].length && (shouldBanByDay || shouldBanByMinute)){
    let key = shouldBanByDay ? keyIpBanByDay : keyIpBanByMinute;
    const {ok, error, data} = await redisController.sendToSortedSet.bind(this)(key, req.currentTime, ip);
    if(ok){
      console.log(`${ip} added to banlist ${key}`);
      result[key] = [[req.currentTime]]; // Lo hago array por que termino trabajando de esa manera todos los valores del result
    }else{
      console.log(`There was a problem adding ${ip} to banlist ${key}`);
      res.status(500).send({message: errorSend.message, error:errorSend.name, status: 500, cause: errorSend.stack});
    }
  }
  if(result[keyIpBanByDay].length || result[keyIpBanByMinute].length){
    let currentTime = result[keyIpBanByDay].length ? result[keyIpBanByDay][0][0] : result[keyIpBanByMinute][0][0]; //Esto es por que termino teniendo Matriz de arrays y el primer valor que enviamos lo hicimos array
    let milisToFinishBan = Number(currentTime) + Number(result[keyIpBanByDay].length ? milisInDay : milisInMinute);
    let textForSend = result[keyIpBanByDay].length ? 'day':'minute';
    res.status(429).send({message: `quota ratio per ${textForSend} exceeded. The ip will be block until ${new Date(milisToFinishBan)}`, error: 'Too Many Requests', status: 429, cause: []})
  }else{
    next();
  }
}

exports.getMeliData = async function (req, res, next) {
  let ip = req.ip.replace('::ffff:', '');
  let route = req.originalUrl;
  const {ok, error, data} = await redisController.getJsonApi.bind(this)(route);
  if(ok){
    if(data === null){
      try {
        const response =  await fetch(routeMeliApi + route);
        const jsonData = await response.json();
        let {ok, error, data} = await redisController.setJsonApi.bind(this)(route, JSON.stringify(jsonData), milisToExpire);//Aca tenemos que enviar el otro redis, el del set|
        if(ok){
          req.jsonData = jsonData;
          console.log(`${route} added to cache until ${new Date(Number(req.currentTime)+ Number(milisToExpire))}`);
          next();
        }else{
          throw error;
        }
      } catch (error) {
        res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
      }
    }else{
      req.jsonData = JSON.parse(data);
      next();
    }
  }else{
    res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
  }
}

exports.updateLogs = async function (req, res) {
  const {ok, error, data} = await redisController.sendToSortedSet.bind(this)(keyLogsByDay, req.currentTime, req.ip.replace('::ffff:', ''), req.originalUrl);
  if(ok){
    res.status(200).json(req.jsonData);
  }else{
    res.status(500).send({message: error.message, error:error.name, status: 500, cause: error.stack});
  }
}
