const Register = require('./Register');

exports.findAll = () => Register.find({}).exec()

exports.saveRegister = req => {
    const newRegister = new Register({
        userToken: req.headers.token || '',
        ipCall: req.ip,
        route: req.originalUrl,
        timeOfCall: new Date()
      });
    return newRegister.save();//return promise
}
