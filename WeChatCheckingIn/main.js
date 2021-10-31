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
  isShowConsoleInPhone,
  quickChecking,
  checkingTime
} = hamibot.env
auto.waitFor()

//日志集
let logMsgList = [];

preWork();
main();

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

function main() {
  home();
  sleep(stepInterval);

  myLog('打开企业微信App')
  let appExist = app.launchApp('企业微信')
  if (!appExist) {
    myLog('未安装企业微信App，结束流程');
    endAll(false);
    return;
  }
  sleep(stepInterval);

  let isLogin = text('微信登录').findOne(1000)
  if (isLogin) {
    myLog('未登录企业微信，请登录');
    endAll(false);
    return;
  }

  let quick = false
  if (quickChecking == 1 || quickChecking == '1') {
    myLog('【打卡模式】快捷打卡');
    quick = quickChecking * 1 == 1
    let checkingHour = checkingTime.split(':')[0]
    let checkingMin = checkingTime.split(':')[1]
    let currentHour = new Date().getHours()
    let currentMin = new Date().getMinutes()
    if (currentHour > checkingHour * 1) {
      // 迟到或者下班卡
      quick = false
    }
    else if (currentMin <= checkingMin * 1 && quick) {
      quick = true
    }
    else {
      // 迟到或者下班卡
      quick = false
    }
  }

  if (quick) {
    check()
  }
  else {
    myLog('【打卡模式】工作台打卡')

    //切换到工作台
    let isInWorkbench = openWorkbench();
    if (!isInWorkbench) {
      endAll(false);
      return;
    }
    sleep(stepInterval);

    //打开打卡页面
    let isInSigninPage = openSigninInWorkbench();
    if (!isInSigninPage) {
      endAll(false);
      return;
    }
    sleep(stepInterval);

    signAction();

    endAll();
  }
}



//打开工作台
function openWorkbench() {
  let matchStr = '工作台';
  myLog('【正在匹配】' + matchStr)
  sleep(stepInterval)
  let isFind = text(matchStr).findOne(1000)
  if (isFind) {
    myLog('匹配成功')
    let isClickSuc = click(matchStr);
    if (isClickSuc) {
      myLog('【进入控制台】成功');
      return true;
    }
    else {
      myLog('【进入控制台】失败');
      return false;
    }
  }
  else {
    myLog('匹配失败，尝试回退')
    back();
    return openWorkbench();
  }
}

//在工作台打开打卡页面
function openSigninInWorkbench() {
  let matchStr = '打卡';
  myLog('【正在匹配】' + matchStr)
  sleep(stepInterval)
  let isFind = text(matchStr).findOne(1000)
  if (isFind) {
    myLog('匹配成功')
    let isClickSuc = click(matchStr);
    if (isClickSuc) {
      myLog('【进入打卡页】成功');
      return true;
    }
    else {
      myLog('【进入打卡页】失败');
      return false;
    }
  }

  sleep(stepInterval);

  myLog('下滑屏幕再次匹配')
  let {
    height,
    width
  } = device
  let x = width / 2
  let y1 = (height / 3) * 2
  let y2 = height / 3
  let swipeResult = swipe(x, y1, x + 5, y2, 500)
  if (swipeResult) {
    sleep(stepInterval / 2)
    return openSigninInWorkbench(matchStr)
  }
}

// 打卡
function signAction() {
  myLog('signAction 开始执行')
  let signIn = text('上班打卡').findOne(1000)
  if (signIn) {
    let stepLeft = signIn.bounds().left + 10
    let stepTop = signIn.bounds().top + 10
    click(stepLeft, stepTop)
    check()
    return;
  }
  let signOut = text('下班打卡').findOne(1000)
  if (signOut) {
    let stepLeft = signOut.bounds().left + 10
    let stepTop = signOut.bounds().top + 10
    click(stepLeft, stepTop)
    check()
    return;
  }
  myLog('打卡未完成，正在检查打卡状态')
  check()
}

// 判断打卡是否完成
function check() {
  sleep(stepInterval)
  myLog('-------开始检测打卡页-------')

  if (textEndsWith('上班·正常').findOne(1000)) {
    myLog('【页面显示】上班·正常');
  }
  if (textStartsWith('上班自动打卡·正常').findOne(1000)) {
    myLog('【页面显示】上班自动打卡·正常')
  }
  if (textStartsWith('迟到打卡').findOne(1000)) {
    myLog('【页面显示】迟到打卡')
  }
  if (textEndsWith('下班·正常').findOne(1000)) {
    myLog('【页面显示】下班·正常')
  }
  if (textStartsWith('今日打卡已完成').findOne(1000)) {
    myLog('【页面显示】今日打卡已完成')
  }
  if (textStartsWith('你早退了').findOne(1000)) {
    myLog('【页面显示】你早退了')
  }
  if (textEndsWith('确认打卡').findOne(1000)) {
    myLog('【页面显示】确认打卡')
  }

  myLog('-------检测结束-------')
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
    msg=msg.replaceAll('\n','\n\n');//Server酱默认两个才能换行
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