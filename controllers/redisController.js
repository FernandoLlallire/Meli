const redisConfig = require('../config/redis');
const constants = require('../constants');

exports.getClientConnection = (clientInfo) => redis.init(clientInfo);
// exports.getClientConnection = (clientInfo) => redisConfig.init();

exports.sendToSortedSet = async function (key, score, ...values) {
  try{
    values.unshift(score); //i always want the score as first element in the array
    await this.zadd([key, score, values.join(constants.sortedSetDelimitator)]);
    return {ok: true};
  } catch (error){
    return {ok: false, error};
  }
}

exports.cleanSortedSet = async function (key, limit) {
  try{
    await this.zremrangebyscore(key, 0, limit, 'WITHSCORES')
    return {ok: true};
  } catch (error){
    return {ok: false, error};
  }
}

exports.getRangeByScore = async function (key) {
  try {
    let data = await this.zrangebyscore(key, '-inf', '+inf', 'WITHSCORES');
    return {ok : true, data};
  } catch (error) {
    return {ok: false, error};
  }
}

//req.ip.replace('::ffff:', '')
