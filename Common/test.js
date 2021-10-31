/*
 * @Author: Ray
 * @Date: 2021-10-31 17:43:21
 * @LastEditTime: 2021-11-01 00:41:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Ray.HamibotScripts\Common\test.js
 */
auto.waitFor();

console.show();

var logger = new RayHamiLog('测试');
var t = logger.test();
console.log(t);

logger.pushPlusNotify('测试标题', '测试内容');


//let logger=new RayHamiLog();
//logger.sendNotify('测试标题','测试内容');

function RayHamiLog(name) {
    const {
        PUSH_PLUS_TOKEN,
        PUSH_PLUS_USER
    } = hamibot.env

    this.name = name;
    this.getName = function () {
        return this.name;
    }

    this.test = function () {
        return PUSH_PLUS_TOKEN;
    }

    this.pushPlusNotify = function (text, desp) {
        return new Promise(resolve => {
            if (PUSH_PLUS_TOKEN) {
                var url = 'http://www.pushplus.plus/send';

                desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
                const body = {
                    token: PUSH_PLUS_TOKEN,
                    title: text,
                    content: desp,
                    topic: PUSH_PLUS_USER
                };

                let res;
                try {
                    res = http.postJson(url, body);
                    if (res.statusCode != 200) {
                        console.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败！！\n')
                    }
                    else {
                        let data = res.body.json();
                        if (data.code === 200) {
                            console.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息成功！！\n')
                        } else {
                            console.log('push+发送' + (PUSH_PLUS_USER ? '一对多' : '一对一') + '通知消息失败！！\n')
                        }
                    }
                }
                catch (e) {
                    console.log(e, resp);
                }
                finally {
                }
            } else {
                console.log('您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知🚫\n');
            }
        })
    }
}
