/*
 * @Author: Ray
 * @Date: 2021-10-31 17:43:21
 * @LastEditTime: 2021-11-01 17:08:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Ray.HamibotScripts\Common\Test\RayHamiLogTest.js
 */
auto.waitFor();

device.wakeUpIfNeeded();

let {
    height,
    width
} = device
let x = width / 2
let y1 = (height / 3) * 2
let y2 = height / 3
swipe(x, y1, x + 5, y2, 500)

console.show();

var logger = new RayHamiLog();

logger.log(1);
logger.log(2);
logger.log('测试');
logger.pushAllLogs();


/*
 * @Author: Ray
 * @Date: 2021-10-31 16:44:42
 * @LastEditTime: 2021-11-01 15:07:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Ray.HamibotScripts\Common\raylog.js
 */
function RayHamiLog(scriptName) {
    const {
        PUSH_PLUS_TOKEN,
        PUSH_PLUS_USER,
        SCKEY
    } = hamibot.env;

    this.scriptName = scriptName;
    this.defaultAuthor = '\n\n by Ray';
    this.defaultTitle = this.scriptName ? this.scriptName : '推送-' + new Date();

    this.logMsgList = new Array();

    /**
     * @description: 记录日志
     * @param {string} msg 日志信息
     * @return {*}
     */
    this.log = function (msg) {
        toastLog(msg);//以气泡显示信息几秒，同时也会输出到控制台
        //console.log(msg);//发送到控制台
        hamibot.postMessage(msg); //发送到控制台的脚本消息

        this.logMsgList.push(msg);//加到缓存里，用作最后的远端推送
    };


    /**
     * @description: 推送所有日志
     * @param {*} title 标题
     * @param {*} params
     * @param {*} author 作者信息
     * @return {*}
     */
    this.pushAllLogs = function (title, params, author) {
        if (!title) title = this.defaultTitle;
        if (!params) params = {};
        if (!author) author = this.defaultAuthor;

        this.log('开始推送日志：');

        if (this.logMsgList.length <= 0) return;

        let msg = "";

        this.logMsgList.forEach(element => {
            msg = msg + element + '\n';
        });

        msg += author;//增加作者信息，防止被贩卖等

        this.pushMsg(title, msg, params);

        this.log('日志推送结束');
    };


    /**
     * @description: 推送消息
     * @param {*} title 标题
     * @param {*} msg 消息
     * @param {*} params
     * @return {*}
     */
    this.pushMsg = function (title, msg, params) {
        Promise.all([
            this.pushPlusNotify(title, msg),
            this.serverNotify(title, msg)
        ]);
    };


    /**
     * @description: 推送到pushplus
     * @param {*} title 标题
     * @param {*} desp 消息
     * @return {*}
     */
    this.pushPlusNotify = function (title, desp) {
        return new Promise(resolve => {
            if (PUSH_PLUS_TOKEN) {
                var url = 'http://www.pushplus.plus/send';

                desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
                const body = {
                    token: PUSH_PLUS_TOKEN,
                    title: title,
                    content: desp,
                    topic: PUSH_PLUS_USER
                };

                let res;
                try {
                    res = http.postJson(url, body);
                    if (res.statusCode != 200) {
                        console.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败！！\n');
                        console.log('statusCode：' + res.statusCode);
                        console.log('body' + res.body.json());
                    }
                    else {
                        let data = res.body.json();
                        if (data.code === 200) {
                            console.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息成功！！\n');
                        } else {
                            console.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败:' + data.msg + '\n');
                        }
                    }
                }
                catch (e) {
                    console.log(e, resp);
                }
                finally {
                    resolve(res);
                }
            }
            else {
                resolve(res);
                //console.log('您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知🚫\n');
            }
        })
    };


    /**
     * @description: 推送到server酱
     * @param {*} title 标题
     * @param {*} desp 消息
     * @param {*} time 超时时间
     * @return {*}
     */
    this.serverNotify = function (title, desp, time) {
        if (!time) time = 2100;
        return new Promise(resolve => {
            if (SCKEY) {
                //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
                desp = desp.replace(/[\n\r]/g, '\n\n');
                const options = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };
                let url = SCKEY.includes('SCT') ?
                    ('https://sctapi.ftqq.com/' + SCKEY + '.send')
                    : ('https://sc.ftqq.com/' + SCKEY + '.send');
                let body = 'text=' + title + '&desp=' + 'desp';
                setTimeout(() => {
                    let res;
                    try {
                        res = http.post(url, body, options);
                        if (res.statusCode != 200) {
                            console.log('发送通知调用API失败！！\n')
                        }
                        else {
                            let data = res.body.json();
                            //server酱和Server酱·Turbo版的返回json格式不太一样
                            if (data.errno === 0 || data.data.errno === 0) {
                                console.log('server酱发送通知消息成功🎉\n')
                            }
                            else if (data.errno === 1024) {
                                // 一分钟内发送相同的内容会触发
                                console.log('server酱发送通知消息异常: ' + data.errmsg + '\n')
                            }
                            else {
                                console.log('server酱发送通知消息异常\n' + JSON.stringify(data))
                            }
                        }
                    }
                    catch (e) {
                        console.log(e, resp);
                    }
                    finally {
                        resolve(res);
                    }
                }, time)
            }
            else {
                //console.log('\n\n您未提供server酱的SCKEY，取消微信推送消息通知🚫\n');
                resolve()
            }
        })
    };


    /**
     * @description: 推送到Bark
     * @param {*} text
     * @param {*} desp
     * @param {*} params
     * @return {*}
     */
    this.barkNotify = function (text, desp, params) {
    };


    /**
     * @description: 推送到Telegram
     * @param {*} text
     * @param {*} desp
     * @return {*}
     */
    this.tgBotNotify = function (text, desp) {

    };


    /**
     * @description: 推送到钉钉机器人
     * @param {*} text
     * @param {*} desp
     * @return {*}
     */
    this.ddBotNotify = function (text, desp) {

    };


    /**
     * @description: 推送到企业微信机器人
     * @param {*} text
     * @param {*} desp
     * @return {*}
     */
    this.qywxBotNotify = function (text, desp) {

    };


    /**
     * @description: 推送到企业微信通道
     * @param {*} text
     * @param {*} desp
     * @return {*}
     */
    this.qywxamNotify = function (text, desp) {

    };


    /**
     * @description: 推送到iGot
     * @param {*} text
     * @param {*} desp
     * @param {*} params
     * @return {*}
     */
    this.iGotNotify = function (text, desp, params) {

    };


    /**
     * @description: 推送到酷推
     * @param {*} text
     * @param {*} desp
     * @return {*}
     */
    this.coolPush = function (text, desp) {

    };
}


//exports.RayHamiLog = RayHamiLog;