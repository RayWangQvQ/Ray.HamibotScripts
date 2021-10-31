/*
 * @Author: Ray
 * @Date: 2021-10-31 16:44:42
 * @LastEditTime: 2021-10-31 17:28:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Ray.HamibotScripts\Common\raylog.js
 */
var RayHamiLog = function () {

    const {
        PUSH_PLUS_TOKEN,
        PUSH_PLUS_USER
    } = hamibot.env

    /**
     * @description: 推送通知功能
     * @param {*} text 通知头
     * @param {*} desp 通知体
     * @param {*} params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
     * @param {*} author 作者仓库等信息  例：`本脚本免费使用 By：xxxx`
     * @return {Promise<unknown>}
     */
    async function sendNotify(text, desp, params = {}, author = '\n\n仅供用于学习') {
        //提供6种通知
        desp += author;//增加作者信息，防止被贩卖等

        await Promise.all([
            pushPlusNotify(text, desp)//pushplus(推送加)
        ])
    }


    function serverNotify(text, desp, time = 2100) {
        return new Promise(resolve => {
            if (SCKEY) {
                //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
                desp = desp.replace(/[\n\r]/g, '\n\n');
                const options = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
                let url = SCKEY.includes('SCT') ? `https://sctapi.ftqq.com/${SCKEY}.send` : `https://sc.ftqq.com/${SCKEY}.send`;
                let body = `text=${text}&desp=${desp}`;
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
                            } else if (data.errno === 1024) {
                                // 一分钟内发送相同的内容会触发
                                console.log(`server酱发送通知消息异常: ${data.errmsg}\n`)
                            } else {
                                console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`)
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
            } else {
                //console.log('\n\n您未提供server酱的SCKEY，取消微信推送消息通知🚫\n');
                resolve()
            }
        })
    }


    function pushPlusNotify(text, desp) {
        return new Promise(resolve => {
            if (PUSH_PLUS_TOKEN) {
                let url = `http://www.pushplus.plus/send`;

                desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
                const body = {
                    token: `${PUSH_PLUS_TOKEN}`,
                    title: `${text}`,
                    content: `${desp}`,
                    topic: `${PUSH_PLUS_USER}`
                };

                let res;
                try {
                    res = http.postJson(url, body);
                    if (res.statusCode != 200) {
                        console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败！！\n`)
                    }
                    else {
                        let data = res.body.json();
                        if (data.code === 200) {
                            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息完成。\n`)
                        } else {
                            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败：${data.msg}\n`)
                        }
                    }
                }
                catch (e) {
                    console.log(e, resp);
                }
                finally {
                    resolve(res);
                }
            } else {
                console.log('您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知🚫\n');
                resolve()
            }
        })
    }


    function barkNotify(text, desp, params = {}) {
        return new Promise(resolve => {
            if (BARK_PUSH) {
                const options = {
                    url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}?sound=${BARK_SOUND}&group=${BARK_GROUP}&${querystring.stringify(params)}`,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout
                }
                $.get(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log('Bark APP发送通知调用API失败！！\n')
                            console.log(err);
                        } else {
                            data = JSON.parse(data);
                            if (data.code === 200) {
                                console.log('Bark APP发送通知消息成功🎉\n')
                            } else {
                                console.log(`${data.message}\n`);
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp);
                    } finally {
                        resolve();
                    }
                })
            } else {
                console.log('您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知🚫\n');
                resolve()
            }
        })
    }
}

module.exports = RayHamiLog;