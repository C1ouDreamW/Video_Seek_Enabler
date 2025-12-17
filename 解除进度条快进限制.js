// ==UserScript==
// @name         通用视频解锁/解除进度条限制
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  1. 强制显示原生视频控件 2. 允许通过键盘(左右箭头)快进快退，绕过网站的JS拦截
// @author       Gemini
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 配置：快进/快退的秒数
    const SEEK_STEP = 5;

    // 核心函数：解锁视频
    function unlockVideo() {
        // 查找页面上所有的 video 标签
        const videos = document.querySelectorAll('video');

        videos.forEach(video => {
            // 1. 移除网站可能覆盖在视频上的透明遮罩层 (导致无法点击)
            // 注意：这可能会误伤某些正常的UI，但在流氓网站上很有用
            // video.style.zIndex = 9999; 
            
            // 2. 强制开启浏览器原生控件 (最关键的一步)
            // 很多网站只是隐藏了原生控件，用自己写死的假进度条糊弄你
            if (!video.controls) {
                video.controls = true;
                console.log('Gemini: 已强制开启原生视频控件');
            }

            // 3. 赋予视频标签鼠标交互权限
            video.style.pointerEvents = 'auto';
        });
    }

    // 监听键盘事件，通过代码直接修改时间，绕过UI层的拦截
    document.addEventListener('keydown', function(e) {
        const video = document.querySelector('video');
        if (!video) return;

        // 按下右箭头 -> 快进
        if (e.key === 'ArrowRight') {
            video.currentTime += SEEK_STEP;
            console.log(`Gemini: 快进至 ${video.currentTime}`);
        }
        // 按下左箭头 -> 后退
        if (e.key === 'ArrowLeft') {
            video.currentTime -= SEEK_STEP;
            console.log(`Gemini: 后退至 ${video.currentTime}`);
        }
        // 按下上箭头 -> 16倍速播放 (可选)
        if (e.key === 'ArrowUp') {
            video.playbackRate = 16.0;
            console.log('Gemini: 开启16倍速');
        }
        // 按下下箭头 -> 恢复1倍速
        if (e.key === 'ArrowDown') {
            video.playbackRate = 1.0;
            console.log('Gemini: 恢复正常速度');
        }
    });

    // 由于很多网站是动态加载视频的 (SPA)，我们需要定时检查
    setInterval(unlockVideo, 1000);

})();