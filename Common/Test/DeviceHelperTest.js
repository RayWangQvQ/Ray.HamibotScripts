/*
 * @Author: your name
 * @Date: 2021-11-01 17:09:07
 * @LastEditTime: 2021-11-01 17:15:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Ray.HamibotScripts\Common\Test\DeviceHelperTest.js
 */

auto.waitFor();

var deviceHelper=new DeviceHelper();
deviceHelper.unlockBySlide();

hamibot.exit();

function DeviceHelper() {
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
}
