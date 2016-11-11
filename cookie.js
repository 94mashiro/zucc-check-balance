var exec = require('child_process').exec
var config = require('./config.js')

exports.getCookie = function () {
  return new Promise(function(resolve, reject) {
    exec('python login.py '+ config.USERNAME + ' ' + config.PASSWORD, function(err,stdout,stderr){
      if (err) {
        reject(err)
      } else {
        resolve(stdout.split('\n')[0])
      }
    })
  });
};
