// ==UserScript==
// @name         通用视频自动跳至结尾
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  1. 视频加载后自动跳转到最后1秒 2. 强制开启原生控件 3. 保留键盘控制
// @author       Gemini
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 配置：快进/快退的秒数 (用于键盘微调)
    const SEEK_STEP = 5;

    // 核心函数：解锁并处理视频
    function processVideo() {
        // 查找页面上所有的 video 标签
        const videos = document.querySelectorAll('video');

        videos.forEach(video => {
            // --- 1. 解锁控件 (基础功能) ---
            if (!video.controls) {
                video.controls = true;
            }
            video.style.pointerEvents = 'auto';

            // --- 2. 自动跳转逻辑 (新增核心) ---
            // 判断条件：视频有时长(不是直播) && 还没自动跳过
            if (isFinite(video.duration) && video.duration > 0 && !video.dataset.isJumped) {

                // 执行跳转：跳到总时长减去1秒
                video.currentTime = video.duration - 1;

                // 打上标记：表示这个视频已经跳过了，防止下一秒又跳一次，导致无法手动回退
                video.dataset.isJumped = 'true';

                console.log(`Gemini: 已自动跳转至视频结尾 (${video.duration}s)`);

                // 可选：如果希望跳转后立刻触发“播放结束”状态，可以取消下面这行的注释
                // video.dispatchEvent(new Event('ended'));
            }
        });
    }

    // --- 3. 键盘控制 (保留作为备用方案) ---
    document.addEventListener('keydown', function(e) {
        const video = document.querySelector('video');
        if (!video) return;

        // 右箭头 -> 快进
        if (e.key === 'ArrowRight') {
            video.currentTime += SEEK_STEP;
            console.log(`Gemini: 手动快进至 ${video.currentTime}`);
        }
        // 左箭头 -> 后退
        if (e.key === 'ArrowLeft') {
            video.currentTime -= SEEK_STEP;
            console.log(`Gemini: 手动后退至 ${video.currentTime}`);
        }
        // 上箭头 -> 16倍速
        if (e.key === 'ArrowUp') {
            video.playbackRate = 16.0;
            console.log('Gemini: 16倍速');
        }
        // 下箭头 -> 恢复正常
        if (e.key === 'ArrowDown') {
            video.playbackRate = 1.0;
            console.log('Gemini: 正常速度');
        }
        // End键 -> 手动跳到结尾
        if (e.key === 'End') {
             if (isFinite(video.duration)) {
                video.currentTime = video.duration - 1;
                // 手动触发也打上标记
                video.dataset.isJumped = 'true';
                console.log('Gemini: 手动跳至结尾');
             }
        }
    });

    // 定时器：每1秒检查一次是否有新视频加载 (适配 B站、慕课网等 SPA 网页)
    setInterval(processVideo, 1000);

})();