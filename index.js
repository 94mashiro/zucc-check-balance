var request = require('superagent')
var cheerio = require('cheerio')
var cookie = require('./cookie.js')
var config = require('./config.js')
var TelegramBot = require('node-telegram-bot-api')
import Sequelize from 'sequelize'
import database from './database'
import pwd from './password'

const TOKEN = config.TOKEN

var bot = new TelegramBot(TOKEN, {polling: true})

bot.onText(/\/help/, function(msg, match) {
  var chatid = msg.chat.id
  bot.sendMessage(chatid, "首次使用需要绑定校园卡账号。\n方式为/bd 学号 身份证后6位。\n提示绑定成功后可使用/balance查看校园卡余额。"
  )
})

bot.onText(/\/bd (.+)/, function(msg, match) {
  var info = match[1].split(" ")
  var chatid = msg.chat.id
  if (info.length != 2) {
    bot.sendMessage(chatid, "绑定失败，请按照正确的格式进行绑定。")
  } else {
    cookie
      .getCookie(info[0], info[1])
      .then(data => {
        if (data.status == 0) {
          bot.sendMessage(chatid, "绑定失败，请检查你的用户名密码是否填写正确。")
        } else {
          add(info[0], info[1], chatid).then(bot.sendMessage(chatid, "绑定成功，你的Cookie是" + data.cookie))
        }
      })
      .catch(err => console.error(err))
  }
})

bot.onText(/\/check/, function(msg, match) {
  console.log('check function');
  var chatid = msg.chat.id
  get(chatid)
    .then(user => {
      if (!user) {
        bot.sendMessage(chatid, "检查失败，请先绑定账号。")
      } else {
        var info = user.dataValues
        bot.sendMessage(chatid, "检查成功，你的用户名为"+info.username+"，密码为"+info.password)
      }
    })
    .catch(err => console.error(err))
})

bot.onText(/\/balance/, function(msg, match) {
  var chatid = msg.chat.id
  get(chatid)
    .then(user => {
      if (!user) {
        bot.sendMessage(chatid, "检查失败，请先绑定账号。")
      } else {
        var info = user.dataValues
        cookie
          .getCookie(info.username, pwd.decrypt(user))
          .then(data => {
            getBalance(data['cookie'])
              .then(balance => {
                bot.sendMessage(chatid, "你账户的余额还有"+balance+"元。")
              })
          })
          .catch(err => console.error(err))
      }
    })
    .catch(err => console.error(err))
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
            var balance = JSON.parse(res.text)['balance']
            resolve(balance)
          })
      })
  });
}


const User = database.define('user', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  chatid: Sequelize.STRING
})

User.sync()

function add(username, password, chatid) {
  return new Promise(function(resolve, reject) {
    User.findOne({
      where: {
        chatid: chatid
      }
    })
    .then(user => {
      if (user) {
        User.update({
          username: username,
          password: pwd.encrypt(user)
        }, {
          where: {
            chatid: chatid
          }
        })
      } else {
        User.create({
          username: username,
          password: password,
          chatid: chatid
        })
        .then(user => {
          User.findOne({
            where: {
              chatid: chatid
            }
          })
          .then(user => {
            User.update({
              password: pwd.encrypt(user)
            }, {
              where: {
                chatid: user.chatid
              }
            })
          })
        })
        .catch(err => reject(err))
      }
    })
    .catch(err => reject(err))
  });
}

function get(chatid) {
  return new Promise(function(resolve, reject) {
    User.findOne({
      where: {
        chatid: chatid
      }
    })
    .then(user => resolve(user))
    .catch(err => reject(err))
  });
}
