# zucc-check-balance

这是一款用来为我自己能随时查看校园卡余额的小程序。

后端使用python并使用requests库进行模拟登陆获取cookie，并且配合nodejs的superagent来抓取余额查询接口地址，通过node-telegram-bot-api返回到我的telegram客户端。

效果图如下：

![image.png](https://ooo.0o0.ooo/2016/11/11/58252885135a5.png)

## 食用方法：

1. `npm install` 安装nodejs依赖
2. `pip install requests` 安装python依赖
3. 在项目根目录下创建`config.js`文件，填写`CHAT_ID` `TOKEN` `USERNAME` `PASSWORD` 四个常量并使用 `export` 导出。
4. `npm run start` 
