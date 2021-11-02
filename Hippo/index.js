/*
 * @Author: Ray
 * @Date: 2021-11-01 10:28:13
 * @LastEditTime: 2021-11-03 00:45:40
 * @LastEditors: Please set LastEditors
 * @Description: 联想智选每日签到
 * @FilePath: \Ray.HamibotScripts\LenovoSignIn\index.js
 */

const {
  stepInterval,
  isShowConsoleInPhone,
  PUSH_PLUS_TOKEN,
  PUSH_PLUS_USER,
  SCKEY
} = hamibot.env;

const scriptName = '盒马领盒花';

auto.waitFor()

const logger = new RayHamiLog(scriptName);
const deviceHelper = new DeviceHelper();

logger.log('唤醒设备并解锁')
deviceHelper.unlockBySlide();

sleep(stepInterval);

if (isShowConsoleInPhone == 1 || isShowConsoleInPhone == "1") {
  logger.log("开启移动端控制台")
  console.show();
}

signIn();


function signIn() {
  home();
  sleep(stepInterval);

  logger.log('打开盒马App')
  let appExist = app.launchApp('盒马');
  if (!appExist) {
    logger.log('未安装盒马App，结束流程');
    endAll(false);
    return;
  }
  sleep(4000);//可能有4s的开屏广告

  let isInHmxz = deviceHelper.findAndClick('盒马小镇');
  if (!isInHmxz) endAll(false);
  sleep(4000);


  logger.log("尝试点击攒盒花坐标（112,1600）");
  let isClickZhh = click(Number(112), Number(1600));
  if (!isClickZhh) endAll(false);
  sleep(4000);

  let isInSin = deviceHelper.findAndClick('去完成', null, 0);
  if (!isInSin) endAll(false);

  endAll(true);
}


//结束流程
function endAll(isSignInSuccess) {
  logger.pushAllLogs();
  home();

  hamibot.exit()
}


// prettier-ignore
function RayHamiLog(scriptName) { const { PUSH_PLUS_TOKEN, PUSH_PLUS_USER, SCKEY } = hamibot.env; this.scriptName = scriptName; this.defaultAuthor = '\n\n by Ray'; this.defaultTitle = this.scriptName ? this.scriptName : '推送-' + new Date(); this.logMsgList = new Array(); this.log = function (msg) { toastLog(msg); hamibot.postMessage(msg); this.logMsgList.push(msg) }; this.logException = function (e) { let msg = JSON.stringify(e); this.log(msg) }; this.pushAllLogs = function (title, params, author) { if (!title) title = this.defaultTitle; if (!params) params = {}; if (!author) author = this.defaultAuthor; this.log('开始推送日志'); if (this.logMsgList.length <= 0) return; let msg = ""; this.logMsgList.forEach(element => { msg = msg + element + '\n' }); msg += author; this.pushMsg(title, msg, params); this.log('日志推送结束') }; this.pushMsg = function (title, msg, params) { Promise.all([this.pushPlusNotify(title, msg), this.serverNotify(title, msg)]) }; this.pushPlusNotify = function (title, desp) { return new Promise(resolve => { if (PUSH_PLUS_TOKEN) { var url = 'http://www.pushplus.plus/send'; desp = desp.replace(/[\n\r]/g, '<br>'); const body = { token: PUSH_PLUS_TOKEN, title: title, content: desp, topic: PUSH_PLUS_USER }; let res; try { res = http.postJson(url, body); if (res.statusCode != 200) { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败！！\n'); this.log('statusCode：' + res.statusCode); this.log('body' + res.body.json()) } else { let data = res.body.json(); if (data.code === 200) { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息成功！！\n') } else { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败:' + data.msg + '\n') } } } catch (e) { this.log('异常：' + JSON.parse(e)); this.log('返回：' + JSON.parse(res)) } finally { resolve(res) } } else { resolve(res) } }) }; this.serverNotify = function (title, desp, time) { if (!time) time = 2100; return new Promise(resolve => { if (SCKEY) { desp = desp.replace(/[\n\r]/g, '\n\n'); const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }; let url = SCKEY.includes('SCT') ? ('https://sctapi.ftqq.com/' + SCKEY + '.send') : ('https://sc.ftqq.com/' + SCKEY + '.send'); let body = { text: title, desp: desp }; let res; try { res = http.post(url, body, options); if (res.statusCode != 200) { this.log('请求server酱接口失败，statusCode：' + res.statusCode + '\n'); this.log('返回：' + res.body.string()) } else { let data = res.body.json(); if (data.errno === 0 || data.data.errno === 0) { this.log('server酱发送通知消息成功🎉\n') } else if (data.errno === 1024) { this.log('server酱发送通知消息异常: ' + data.errmsg + '\n') } else { this.log('server酱发送通知消息异常\n' + JSON.stringify(data)) } } } catch (e) { this.log('异常：' + JSON.parse(e)); this.log('返回：' + JSON.parse(res)) } finally { resolve(res) } } else { resolve() } }) }; this.barkNotify = function (text, desp, params) { }; this.tgBotNotify = function (text, desp) { }; this.ddBotNotify = function (text, desp) { }; this.qywxBotNotify = function (text, desp) { }; this.qywxamNotify = function (text, desp) { }; this.iGotNotify = function (text, desp, params) { }; this.coolPush = function (text, desp) { } }

// prettier-ignore
function DeviceHelper(scriptName) { const { stepInterval, SLIDE_COUNT, SLIDE_DURATION, PWD_COORDINATES_STR } = hamibot.env; if (!stepInterval) stepInterval = 1000; this.logger = new RayHamiLog(scriptName); this.unlockDevice = function () { this.unlockBySlide(); this.unlockByPwd() }; this.unlockBySlide = function (slideDuration, slideCount) { if (!slideDuration) slideDuration = !SLIDE_DURATION ? 500 : SLIDE_DURATION; if (!slideCount) slideCount = !SLIDE_COUNT ? 1 : SLIDE_COUNT; device.wakeUpIfNeeded(); sleep(500); let { height, width } = device; let xStart = width / 2; let xEnd = xStart + 5; let yStart = height * 0.8; let yEnd = height * 0.2; while (slideCount--) { swipe(xStart, yStart, xEnd, yEnd, slideDuration) } }; this.unlockByPwd = function (pwdCoordinatesStr) { if (!pwdCoordinatesStr) pwdCoordinatesStr = PWD_COORDINATES_STR; if (!pwdCoordinatesStr || pwdCoordinatesStr.length < 1) { this.logger.log('配置的密码坐标为空，结束流程'); return } let pwd_array = new Array(); pwd_array = pwdCoordinatesStr.split('\n'); var two_text; for (i = 0; i < pwd_array.length; i++) { two_text = pwd_array[i].split(','); pwd_array[i] = new Array(); pwd_array[i][0] = two_text[0]; pwd_array[i][1] = two_text[1] } device.wakeUpIfNeeded(); sleep(1000); for (i = 0; i < pwd_array.length; i++) { click(Number(pwd_array[i][0]), Number(pwd_array[i][1])); sleep(1000) } }; this.findAndClick = function (matchText, matchType, tryBackCount) { if (!tryBackCount) tryBackCount = 3; sleep(1000); this.logger.log('开始匹配【' + matchText + '】'); let tryCount = 1; let uiObj = this.findText(matchText, matchType); while (uiObj == null && tryCount <= tryBackCount) { sleep(1000); this.logger.log('未找到，尝试第' + tryCount + '次回退'); back(); uiObj = this.findText(matchText, matchType); tryCount++ } if (uiObj != null) { this.logger.log('匹配成功'); sleep(1000); let isClickSuc = click(matchText); if (isClickSuc) { this.logger.log('点击成功'); return true } else { this.logger.log('点击失败') } } else { this.logger.log('匹配失败') } return false }; this.findText = function (matchText, matchType) { try { let matchTypes = new SelectorTextMatchType(); if (!matchType || !(matchType in matchTypes)) matchType = matchTypes.textContains; var f = matchType + "('" + matchText + "')"; var selector = eval(f); return selector.findOne(1000) } catch (e) { this.logger.logException(e) } return null }; function SelectorTextMatchType() { this.text = 'text'; this.textContains = 'textContains'; this.textStartsWith = 'textStartsWith'; this.textMatches = 'textMatches' } } function RayHamiLog(scriptName) { const { PUSH_PLUS_TOKEN, PUSH_PLUS_USER, SCKEY } = hamibot.env; this.scriptName = scriptName; this.defaultAuthor = '\n\n by Ray'; this.defaultTitle = this.scriptName ? this.scriptName : '推送-' + new Date(); this.logMsgList = new Array(); this.log = function (msg) { toastLog(msg); hamibot.postMessage(msg); this.logMsgList.push(msg) }; this.logException = function (e) { let msg = JSON.stringify(e); this.log(msg) }; this.pushAllLogs = function (title, params, author) { if (!title) title = this.defaultTitle; if (!params) params = {}; if (!author) author = this.defaultAuthor; this.log('开始推送日志'); if (this.logMsgList.length <= 0) return; let msg = ""; this.logMsgList.forEach(element => { msg = msg + element + '\n' }); msg += author; this.pushMsg(title, msg, params); this.log('日志推送结束') }; this.pushMsg = function (title, msg, params) { Promise.all([this.pushPlusNotify(title, msg), this.serverNotify(title, msg)]) }; this.pushPlusNotify = function (title, desp) { return new Promise(resolve => { if (PUSH_PLUS_TOKEN) { var url = 'http://www.pushplus.plus/send'; desp = desp.replace(/[\n\r]/g, '<br>'); const body = { token: PUSH_PLUS_TOKEN, title: title, content: desp, topic: PUSH_PLUS_USER }; let res; try { res = http.postJson(url, body); if (res.statusCode != 200) { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败！！\n'); this.log('statusCode：' + res.statusCode); this.log('body' + res.body.json()) } else { let data = res.body.json(); if (data.code === 200) { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息成功！！\n') } else { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败:' + data.msg + '\n') } } } catch (e) { this.log('异常：' + JSON.parse(e)); this.log('返回：' + JSON.parse(res)) } finally { resolve(res) } } else { resolve(res) } }) }; this.serverNotify = function (title, desp, time) { if (!time) time = 2100; return new Promise(resolve => { if (SCKEY) { desp = desp.replace(/[\n\r]/g, '\n\n'); const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }; let url = SCKEY.includes('SCT') ? ('https://sctapi.ftqq.com/' + SCKEY + '.send') : ('https://sc.ftqq.com/' + SCKEY + '.send'); let body = { text: title, desp: desp }; let res; try { res = http.post(url, body, options); if (res.statusCode != 200) { this.log('请求server酱接口失败，statusCode：' + res.statusCode + '\n'); this.log('返回：' + res.body.string()) } else { let data = res.body.json(); if (data.errno === 0 || data.data.errno === 0) { this.log('server酱发送通知消息成功🎉\n') } else if (data.errno === 1024) { this.log('server酱发送通知消息异常: ' + data.errmsg + '\n') } else { this.log('server酱发送通知消息异常\n' + JSON.stringify(data)) } } } catch (e) { this.log('异常：' + JSON.parse(e)); this.log('返回：' + JSON.parse(res)) } finally { resolve(res) } } else { resolve() } }) }; this.barkNotify = function (text, desp, params) { }; this.tgBotNotify = function (text, desp) { }; this.ddBotNotify = function (text, desp) { }; this.qywxBotNotify = function (text, desp) { }; this.qywxamNotify = function (text, desp) { }; this.iGotNotify = function (text, desp, params) { }; this.coolPush = function (text, desp) { } }
