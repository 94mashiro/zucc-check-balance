var request = require('superagent')
var cheerio = require('cheerio')
var cookie = require('./cookie.js')
var config = require('./config.js')
var TelegramBot = require('node-telegram-bot-api')

const TOKEN = config.TOKEN
const CHAT_ID = config.CHAT_ID

var bot = new TelegramBot(TOKEN,{polling: true})

console.log('python login.py '+ config.USERNAME + ' ' + config.PASSWORD);

cookie.getCookie().then(result => {
  bot.onText(/checkbalance/, function(msg,match){
    getBalance(result)
  })
})


function getBalance(cookie) {
  return new Promise(function(resolve, reject) {
    request
      .get('http://student.zucc.edu.cn/index.portal')
      .set('Cookie', cookie)
      .end(function(err,res){
        var url_0 = 'http://student.zucc.edu.cn/index.portal' + res.text.match(/url :(.+?)',/g)[1].split("'")[1]
        request
          .get(url_0)
          .set('Cookie', cookie)
          .end(function(err,res){
            console.log(res.text);
            var message = '你饭卡的余额有: ' + JSON.parse(res.text)['balance'] + ' 元'
            bot.sendMessage(CHAT_ID, message)
          })
      })
  });
}
