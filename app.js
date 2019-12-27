const cluster = require('cluster');
const express = require('express');
const registerModel = require('./models/register.model');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running with ${numCPUs}`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  require("./config/mongodb");
  app.get('/', (req, res) =>{registerModel.saveRegister(req).then(save => console.log(save)).catch(error => console.log(error))});

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
  // https://www.npmjs.com/package/loadtest
  console.log(`Worker ${process.pid} started`);
}
