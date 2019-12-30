exports.getLogsByDay = (req, res, next,  redisContex) => {
  const milisInMinute = 60000;
  const milisInDay = 86400000;
  const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size).reverse()
  );
  req.requestCurrentTime = Date.now();
  redisContex.zrange('logsByDay', 0, Number(req.requestCurrentTime) - Number(milisInDay), 'WITHSCORES', (err,res) => {
        if(err)
          console.log(err);
        else{
          req.logsByDay = chunk(res,2);
          next();
        }
    })
}

exports.
