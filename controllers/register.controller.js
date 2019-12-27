const registerModel = require('../models/register.model');

exports.sendRegister = req => {
  registerModel.saveRegister(req)
   .catch(error => console.error(`There was an error saving the log in Mongodb : ${error}`))
   .then(proccess => console.log(`Register save : ${process}`))
};
