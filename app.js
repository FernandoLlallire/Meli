const cluster = require('cluster');
const express = require('express');
const registerController = require('./controllers/register.controller');
const redisControler = require('./controllers/redisController');
const redisMiddleware = require('./middleware/redisMiddleware');
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
  const app = express();
  const redisCache = redisControler.getClientConnection(containerRedisLogs);
  // const redisLogs = redisControler.getClientConnection();
  // require("./config/mongodb");
  // app.get('/', (req, res) =>{registerController.sendRegister(req).then(save => res.status(200).send(save))});
  // app.get('/list', (req, res) => registerController.getAll().then(data => res.status(200).send(data)))
  // app.get('/save', (req, res) => util.promisify(redis_cache.hmset([req.originalUrl,'ipCall',req.ip,'route',req.originalUrl,'timeOfCall',new Date()])).bind(redis_cache).then(x=>console.log('todo bien ',x).catch(x=>console.log('errores al mandar a redis',x))));
  app.get('/save', (req, res, next) => redisMiddleware.checkByDay(req, res, next, redisLogs), (req, res) => res.status(200).send('Log guardado'));// ver el tema de los errores con promisify
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
  // https://www.npmjs.com/package/loadtest
  console.log(`Worker ${process.pid} started`);
}
