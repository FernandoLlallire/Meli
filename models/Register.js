// grab the things we need
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var registerSchema = new Schema({
  userToken: {type: String, requiere: true},
  ipCall: {type: String, requiere: true},
  route: {type: String, requiere: true},
  timeOfCall: {type: Date, requiere: true}
});

var Register = mongoose.model('Register', registerSchema);

module.exports = Register;
