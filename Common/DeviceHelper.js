/*
 * @Author: Ray
 * @Date: 2021-11-01 16:53:42
 * @LastEditTime: 2021-11-02 18:01:35
 * @LastEditors: Please set LastEditors
 * @Description: 设备帮助类
 * @FilePath: \Ray.HamibotScripts\Common\DeviceHelper.js
 */
function DeviceHelper(scriptName) {

    const {
        stepInterval,
        PWD_COORDINATES_STR
    } = hamibot.env;

    if (!stepInterval) stepInterval = 1000;

    this.logger = new RayHamiLog(scriptName);

    this.unlockDevice=function(){
        
    }

    /**
     * @description: 滑动解锁（未点亮屏幕的话会先点亮，滑动坐标：以左上角为原点，从屏幕中间，纵坐标从下往上，由0.8y滑到0.2y处）
     */
    this.unlockBySlide = function () {
        device.wakeUpIfNeeded();
        sleep(1000);

        let {
            height,
            width
        } = device;

        let xStart = width / 2;
        let xEnd = xStart + 5;
        let yStart = height * 0.8;
        let yEnd = height * 0.2;

        let duration = 500;

        swipe(xStart, yStart, xEnd, yEnd, duration);
    };

    /**
     * @description: 密码解锁
     * @param {*} pwdCoordinatesStr 密码的坐标字符串
     * @return {*}
     */
    this.unlockByPwd = function (pwdCoordinatesStr) {
        if (!pwdCoordinatesStr) pwdCoordinatesStr = PWD_COORDINATES_STR;
        if(!pwdCoordinatesStr||pwdCoordinatesStr.length<1){
            this.logger.log('配置的密码坐标为空，结束流程');
            return;
        }

        //解析坐标字符串为数组
        let pwd_array=new Array();
        pwd_array = pwdCoordinatesStr.split(';');
        var two_text;
        for (i = 0; i < two_dimensional.length; i++) {
            two_text = two_dimensional[i].split(',');
            two_dimensional[i] = new Array();
            two_dimensional[i][0] = two_text[0];
            two_dimensional[i][1] = two_text[1];
        }

        //唤醒设备
        device.wakeUpIfNeeded();
        sleep(1000);

        //点击坐标
        for (i = 0; i < pwd_array.length; i++) {
            click(Number(pwd_array[i][0]), Number(pwd_array[i][1]));
            sleep(1000);
        }
    }


    /**
     * @description: 匹配并点击
     * @param {*} matchText 匹配文字
     * @param {*} matchType 匹配类型（text、textContains、textStartsWith、textMatches）
     * @param {*} tryBackCount 尝试回退次数
     * @return {*}
     */
    this.findAndClick = function (matchText, matchType, tryBackCount) {
        if (!tryBackCount) tryBackCount = 3;
        sleep(1000);
        this.logger.log('开始匹配【' + matchText + '】');
        let tryCount = 1;
        let uiObj = this.findText(matchText, matchType);
        while (uiObj == null && tryCount <= tryBackCount) {
            sleep(1000);
            this.logger.log('未找到，尝试第' + tryCount + '次回退');
            back();
            uiObj = this.findText(matchText, matchType);
            tryCount++;
        }

        if (uiObj != null) {
            this.logger.log('匹配成功');

            sleep(1000);
            //let isClickSuc = uiObj.click();
            let isClickSuc = click(matchText);

            if (isClickSuc) {
                this.logger.log('点击成功');
                return true;
            }
            else {
                this.logger.log('点击失败');
            }
        }
        else {
            this.logger.log('匹配失败');
        }
        return false;
    };


    /**
     * @description: 匹配文字
     * @param {*} matchText 匹配的文字
     * @param {*} matchType 匹配类型（text、textContains、textStartsWith、textMatches）
     * @return {UiObject}
     */
    this.findText = function (matchText, matchType) {
        try {
            let matchTypes = new SelectorTextMatchType();
            if (!matchType || !(matchType in matchTypes)) matchType = matchTypes.textContains;
            var f = matchType + "('" + matchText + "')";
            var selector = eval(f);
            return selector.findOne(1000);
        }
        catch (e) {
            this.logger.logException(e);
        }
        return null;
    };

    function SelectorTextMatchType() {
        this.text = 'text';
        this.textContains = 'textContains';
        this.textStartsWith = 'textStartsWith';
        this.textMatches = 'textMatches';
    }
}

function RayHamiLog(scriptName) { const { PUSH_PLUS_TOKEN, PUSH_PLUS_USER, SCKEY } = hamibot.env; this.scriptName = scriptName; this.defaultAuthor = '\n\n by Ray'; this.defaultTitle = this.scriptName ? this.scriptName : '推送-' + new Date(); this.logMsgList = new Array(); this.log = function (msg) { toastLog(msg); hamibot.postMessage(msg); this.logMsgList.push(msg) }; this.logException = function (e) { let msg = JSON.stringify(e); this.log(msg) }; this.pushAllLogs = function (title, params, author) { if (!title) title = this.defaultTitle; if (!params) params = {}; if (!author) author = this.defaultAuthor; this.log('开始推送日志'); if (this.logMsgList.length <= 0) return; let msg = ""; this.logMsgList.forEach(element => { msg = msg + element + '\n' }); msg += author; this.pushMsg(title, msg, params); this.log('日志推送结束') }; this.pushMsg = function (title, msg, params) { Promise.all([this.pushPlusNotify(title, msg), this.serverNotify(title, msg)]) }; this.pushPlusNotify = function (title, desp) { return new Promise(resolve => { if (PUSH_PLUS_TOKEN) { var url = 'http://www.pushplus.plus/send'; desp = desp.replace(/[\n\r]/g, '<br>'); const body = { token: PUSH_PLUS_TOKEN, title: title, content: desp, topic: PUSH_PLUS_USER }; let res; try { res = http.postJson(url, body); if (res.statusCode != 200) { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败！！\n'); this.log('statusCode：' + res.statusCode); this.log('body' + res.body.json()) } else { let data = res.body.json(); if (data.code === 200) { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息成功！！\n') } else { this.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败:' + data.msg + '\n') } } } catch (e) { this.log('异常：' + JSON.parse(e)); this.log('返回：' + JSON.parse(res)) } finally { resolve(res) } } else { resolve(res) } }) }; this.serverNotify = function (title, desp, time) { if (!time) time = 2100; return new Promise(resolve => { if (SCKEY) { desp = desp.replace(/[\n\r]/g, '\n\n'); const options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }; let url = SCKEY.includes('SCT') ? ('https://sctapi.ftqq.com/' + SCKEY + '.send') : ('https://sc.ftqq.com/' + SCKEY + '.send'); let body = { text: title, desp: desp }; let res; try { res = http.post(url, body, options); if (res.statusCode != 200) { this.log('请求server酱接口失败，statusCode：' + res.statusCode + '\n'); this.log('返回：' + res.body.string()) } else { let data = res.body.json(); if (data.errno === 0 || data.data.errno === 0) { this.log('server酱发送通知消息成功🎉\n') } else if (data.errno === 1024) { this.log('server酱发送通知消息异常: ' + data.errmsg + '\n') } else { this.log('server酱发送通知消息异常\n' + JSON.stringify(data)) } } } catch (e) { this.log('异常：' + JSON.parse(e)); this.log('返回：' + JSON.parse(res)) } finally { resolve(res) } } else { resolve() } }) }; this.barkNotify = function (text, desp, params) { }; this.tgBotNotify = function (text, desp) { }; this.ddBotNotify = function (text, desp) { }; this.qywxBotNotify = function (text, desp) { }; this.qywxamNotify = function (text, desp) { }; this.iGotNotify = function (text, desp, params) { }; this.coolPush = function (text, desp) { } }
