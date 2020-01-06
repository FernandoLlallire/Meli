const cluster = require('cluster');
const redisControler = require('./controllers/redisController');
const {containerRedisLogs, containerRedisCache} = require('./constants');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running with ${numCPUs} threads`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const redisLogs = redisControler.getClientConnection(containerRedisLogs);
  const redisCache = redisControler.getClientConnection(containerRedisCache);
  const app = require('express')();
  const routesForRedis = require('./routes/routesLogs')(redisLogs, redisCache);

  app.use('/', routesForRedis);
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
  // https://www.npmjs.com/package/loadtest
  //docker exec -it <container name> /bin/bash
  console.log(`Worker ${process.pid} started`);
}
