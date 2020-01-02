const redis = require('../config/redis');
const constants = require('../constants');

exports.getClientConnection = (clientInfo) => redis.init(clientInfo);

exports.sendToSortedSet = async (clientConnection, key, score, ...values) => {
  try{
    values.unshift(score); //i always want the score as first element in the array
    await clientConnection.zadd([key, score, values.join(constants.sortedSetDelimitator)]);
    console.log(`${values} sent to ${key}`);
  } catch (ex){
    console.log(`There was a problem trying to send ${values} values with ${key} key to ${clientConnection.clientInfo} client`, ex);
  }
}

exports.cleanSortedSet = async (clientConnection, key, limit) =>{
  try{
    await clientConnection.zremrangebyscore(key, 0, limit, 'WITHSCORES')
    console.log(`${key} key was cleaned up to ${limit} score`);
  } catch (ex){
    console.log(`There was a problem cleaning ${key} for ${clientConnection.clientInfo} client`, ex);
  }
}


//req.ip.replace('::ffff:', '')
