/*
 * @Author: your name
 * @Date: 2021-11-01 17:09:07
 * @LastEditTime: 2021-11-01 17:46:38
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Ray.HamibotScripts\Common\Test\DeviceHelperTest.js
 */

auto.waitFor();

var deviceHelper = new DeviceHelper();
deviceHelper.unlockBySlide();

app.launchApp('微信');
deviceHelper.findAndClick('发现');

hamibot.exit();

/*
 * @Author: Ray
 * @Date: 2021-11-01 16:53:42
 * @LastEditTime: 2021-11-01 17:36:27
 * @LastEditors: Please set LastEditors
 * @Description: 设备帮助类
 * @FilePath: \Ray.HamibotScripts\Common\DeviceHelper.js
 */
function DeviceHelper(scriptName) {

    this.logger=new RayHamiLog(scriptName);

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

        swipe(xStart, yStart, xEnd, yEnd, duration)
    }

    this.findAndClick = function (matchText) {
        this.logger.log('开始匹配' + matchText)
        let matchStr = matchText;
        let isFind = selector().text(matchStr).findOne(1000);
        let tryCount = 0;
        while (!isFind && tryCount < 3) {
            back();
            isFind = text(matchStr).findOne(1000);
        }

        if (isFind) {
            this.logger.log('匹配' + matchText + '成功')
            let isClickSuc = click(matchStr);
            if (isClickSuc) {
                this.logger.log('点击成功');
                return true;
            }
            else {
                this.logger.log('点击失败');
            }
        }
        else {
            this.logger.log('匹配' + matchText + '失败');
        }
        return false;
    }
}

function RayHamiLog(scriptName){const{PUSH_PLUS_TOKEN,PUSH_PLUS_USER,SCKEY}=hamibot.env;this.scriptName=scriptName;this.defaultAuthor='\n\n by Ray';this.defaultTitle=this.scriptName?this.scriptName:'推送-'+new Date();this.logMsgList=new Array();this.log=function(msg){toastLog(msg);hamibot.postMessage(msg);this.logMsgList.push(msg)};this.pushAllLogs=function(title,params,author){if(!title)title=this.defaultTitle;if(!params)params={};if(!author)author=this.defaultAuthor;this.logger.log('开始推送日志');if(this.logMsgList.length<=0)return;let msg="";this.logMsgList.forEach(element=>{msg=msg+element+'\n'});msg+=author;this.pushMsg(title,msg,params);this.logger.log('日志推送结束')};this.pushMsg=function(title,msg,params){Promise.all([this.pushPlusNotify(title,msg),this.serverNotify(title,msg)])};this.pushPlusNotify=function(title,desp){return new Promise(resolve=>{if(PUSH_PLUS_TOKEN){var url='http://www.pushplus.plus/send';desp=desp.replace(/[\n\r]/g,'<br>');const body={token:PUSH_PLUS_TOKEN,title:title,content:desp,topic:PUSH_PLUS_USER};let res;try{res=http.postJson(url,body);if(res.statusCode!=200){this.logger.log('push+发送'+(PUSH_PLUS_USER?'一对多':'一对一')+'通知消息失败！！\n');this.logger.log('statusCode：'+res.statusCode);this.logger.log('body'+res.body.json())}else{let data=res.body.json();if(data.code===200){this.logger.log('push+发送'+(PUSH_PLUS_USER?'一对多':'一对一')+'通知消息成功！！\n')}else{this.logger.log('push+发送'+(PUSH_PLUS_USER?'一对多':'一对一')+'通知消息失败:'+data.msg+'\n')}}}catch(e){this.logger.log('异常：'+JSON.parse(e));this.logger.log('返回：'+JSON.parse(res))}finally{resolve(res)}}else{resolve(res)}})};this.serverNotify=function(title,desp,time){if(!time)time=2100;return new Promise(resolve=>{if(SCKEY){desp=desp.replace(/[\n\r]/g,'\n\n');const options={headers:{'Content-Type':'application/x-www-form-urlencoded'}};let url=SCKEY.includes('SCT')?('https://sctapi.ftqq.com/'+SCKEY+'.send'):('https://sc.ftqq.com/'+SCKEY+'.send');let body={text:title,desp:desp};let res;try{res=http.post(url,body,options);if(res.statusCode!=200){this.logger.log('请求server酱接口失败，statusCode：'+res.statusCode+'\n');this.logger.log('返回：'+res.body.string())}else{let data=res.body.json();if(data.errno===0||data.data.errno===0){this.logger.log('server酱发送通知消息成功🎉\n')}else if(data.errno===1024){this.logger.log('server酱发送通知消息异常: '+data.errmsg+'\n')}else{this.logger.log('server酱发送通知消息异常\n'+JSON.stringify(data))}}}catch(e){this.logger.log('异常：'+JSON.parse(e));this.logger.log('返回：'+JSON.parse(res))}finally{resolve(res)}}else{this.logger.log('\n\n您未提供server酱的SCKEY，取消微信推送消息通知🚫\n');resolve()}})};this.barkNotify=function(text,desp,params){};this.tgBotNotify=function(text,desp){};this.ddBotNotify=function(text,desp){};this.qywxBotNotify=function(text,desp){};this.qywxamNotify=function(text,desp){};this.iGotNotify=function(text,desp,params){};this.coolPush=function(text,desp){}}
