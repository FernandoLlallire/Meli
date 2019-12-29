const registerModel = require('../models/register.model');

exports.sendRegister = req => registerModel.saveRegister(req)
   .catch(err => console.error('There was an error saving the log in Mongodb :', err))
   .then(data => {
     return JSON.stringify(data);
   })

exports.getAll = () => registerModel.findAll()
.catch(err => console.error("There was an error fetching all registers", err))
.then(response => {console.log("mensaje que tendria que llegar", response); return JSON.stringify(response);})
