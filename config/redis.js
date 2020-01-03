const redis = require('redis');
const util = require('util');
// redis.debug_mode = true;

exports.init = (clientInfo) => {
  // let client = redis.createClient({host: clientInfo});
  let client = redis.createClient();
  client.on('error', (err) => console.log(err));
  return {
    // client: client,
    clientInfo: clientInfo,
    zadd: promisify(client.zadd).bind(client),
    zremrangebyscore: promisify(client.zremrangebyscore).bind(client),
    zrange: promisify(client.zrange).bind(client),
    zrangebyscore: promisify(client.zrangebyscore).bind(client)
  }
}
