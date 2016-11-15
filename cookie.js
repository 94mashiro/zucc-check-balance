import request from 'superagent'
import { POSTURL } from './config'
exports.getCookie = function(username, password) {
  return new Promise(function(resolve, reject) {
    request
      .post(POSTURL)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        'username': username,
        'password': password
      })
      .end(function(err,res){
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(res.text))
        }
      })
  });
}
