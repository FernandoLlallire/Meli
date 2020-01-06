const redisConfig = require('../config/redis');
const {sortedSetDelimitator} = require('../constants');
const redis = require('../config/redis')

exports.getClientConnection = (clientInfo) => redis.init(clientInfo);
// exports.getClientConnection = (clientInfo) => redisConfig.init();

exports.sendToSortedSet = async function (key, score, ...values) {
  try {
    values.unshift(score); //i always want the score as first element in the array
    await this.zadd([key, score, values.join(sortedSetDelimitator)]);
    return {ok: true};
  } catch (error){
    return {ok: false, error};
  }
}

exports.cleanSortedSet = async function (key, limit) {
  try {
    await this.zremrangebyscore(key, '-inf', limit);
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

exports.setJsonApi = async function (route, json, timeInMillisToExpire) {
  try {
    await this.set(route, json, 'PX', timeInMillisToExpire);
    return {ok: true}
  } catch (error){
    return {ok: false, error};
  }
}

exports.getJsonApi = async function (route) {
  try {
    let data = await this.get(route);
    return {ok: true, data};
  } catch (error) {
    return {ok: false, error};
  }
}
//req.ip.replace('::ffff:', '')
