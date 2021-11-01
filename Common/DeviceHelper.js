/*
 * @Author: Ray
 * @Date: 2021-11-01 16:53:42
 * @LastEditTime: 2021-11-01 17:19:58
 * @LastEditors: Please set LastEditors
 * @Description: 设备帮助类
 * @FilePath: \Ray.HamibotScripts\Common\DeviceHelper.js
 */
function DeviceHelper() {

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
}