/**
 * 检查无障碍服务是否已经启用
 * auto.waitFor()则会在在无障碍服务启动后继续运行
 * https://docs.hamibot.com/reference/widgetsBasedAutomation
 */
const {
  pushPlusToken,
  chanSendKey,
  barkUrl,
  stepInterval,
  isShowConsoleInPhone
} = hamibot.env
auto.waitFor()

//日志集
let logMsgList = [];

preWork();
signIn();
checkResult();

//预备工作
function preWork() {
  myLog('唤醒设备')
  device.wakeUpIfNeeded()

  myLog('滑动解锁')
  let {
    height,
    width
  } = device
  let x = width / 2
  let y1 = (height / 3) * 2
  let y2 = height / 3
  swipe(x, y1, x + 5, y2, 500)

  sleep(stepInterval);

  if (isShowConsoleInPhone == 1 || isShowConsoleInPhone == "1") {
    myLog("开启移动端控制台")
    console.show();
  }
}

function signIn() {
  home();
  sleep(stepInterval);

  myLog('打开联想智选App')
  let appExist = app.launchApp('联想智选')
  if (!appExist) {
    myLog('未安装联想智选App，结束流程');
    endAll(false);
    return;
  }
  sleep(4000);//可能有4s的开屏广告

  //点击签到领好礼
  let matchStr = '签到领好礼';
  let isFind = text(matchStr).findOne(1000);
  let tryCount=0;
  while(!isFind&&tryCount<3){
    back();
    isFind=text(matchStr).findOne(1000);
  }
  if (isFind) {
    myLog('匹配签到按钮成功')
    let isClickSuc = click(matchStr);
    if (isClickSuc) {
      myLog('点击成功');
    }
    else {
      myLog('点击失败');
    }

    let result = checkResult();
    endAll(result);
  }
  else{
    myLog('匹配签到按钮失败');
    endAll(false);
  }
}

function checkResult(){
  sleep(stepInterval)
  myLog('-------开始检测-------')

  let result=false;

  if (textContains('已连续签到').findOne(1000)) {
    myLog('签到成功');
    result=true;
  }
  else{
    myLog('检测失败');
  }

  myLog('-------检测结束-------')
  return result;
}

// 多端打印日志
function myLog(msg) {
  toastLog(msg);//以气泡显示信息几秒，同时也会输出到控制台
  //console.log(msg);//发送到控制台
  hamibot.postMessage(msg); //发送到控制台的脚本消息

  logMsgList.push(msg);
}

// 日志记录Http请求返回内容
function logHttpResponse(res) {
  myLog("打印请求结果");
  myLog("返回状态码：" + res.statusCode);
  myLog("返回Body：" + res.body.string());
}

// 远端推送
function pushLogsToRemotes() {
  if (logMsgList.length <= 0) return;

  let msg = "";

  let dd = new Date()
  let formatDate = dateFormat(dd, "yyyy-MM-dd hh:mm");
  let msgTitle = '企业微信打卡通知(' + formatDate + ')';

  logMsgList.forEach(element => {
    msg = msg + element + '\n';
  });


  if (pushPlusToken && pushPlusToken.trim() !== '') {
    myLog("开始推送到：PushPlus");
    let pushPlusUrl = 'http://www.pushplus.plus/send'
    let pushPlusRes = http.post(pushPlusUrl, {
      token: pushPlusToken,
      title: msgTitle,
      content: msg
    });
    logHttpResponse(pushPlusRes);
  }

  if (chanSendKey && chanSendKey.trim() !== '') {
    msg = msg.replaceAll('\n', '\n\n');//Server酱默认两个才能换行
    myLog("开始推送到：Server酱");
    let chanUrl = 'https://sctapi.ftqq.com/' + chanSendKey + '.send';
    let chanRes = http.post(chanUrl, {
      title: msgTitle,
      desp: msg
    })
    logHttpResponse(chanRes);
  }

  if (barkUrl && barkUrl.trim() !== '') {
    myLog("开始推送到：Bark");
    let url = barkUrl + msg + '/' + formatDate
    let barkRes = http.get(url)
    logHttpResponse(barkRes);
  }
}

// 格式化时间
function dateFormat(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1,                 //月份   
    "d+": date.getDate(),                    //日   
    "h+": date.getHours(),                   //小时   
    "m+": date.getMinutes(),                 //分   
    "s+": date.getSeconds(),                 //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

//结束流程
function endAll(isSignInSuccess) {
  myLog("开始推送日志");
  pushLogsToRemotes();
  home();

  hamibot.exit()
}