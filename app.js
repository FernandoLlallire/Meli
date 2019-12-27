const cluster = require('cluster');
const express = require('express');
const numCPUs = require('os').cpus().length;
//
// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running with ${numCPUs}`);
//
//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }
  require("./config/mongodb");
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
  const app = express();

  app.get('/', (req, res , next) => {setTimeout((header) => {console.log(process.pid);next();}, 300)},(req, res, next) => {
      res.send('Hello World! Holaaa guachooo');
    next();
  }, (req, res) => {});

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
//   // https://www.npmjs.com/package/loadtest
//   console.log(`Worker ${process.pid} started`);
// }
