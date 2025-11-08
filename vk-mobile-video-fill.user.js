// ==UserScript==
// @name         VK Mobile Video player fill
// @namespace    https://amo.fyi
// @version      1.2
// @description  Expands video player to fill screen space
// @author       Amith M
// @match        https://m.vk.com/*
// @match        https://m.vkvideo.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vk.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/vk-mobile-video-fill.user.js
// @downloadURL  https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/vk-mobile-video-fill.user.js
// ==/UserScript==

(function () {
    'use strict';

    let selector = "body #vk_wrap";

    // document.querySelector(selector).style.maxWidth="calc(100vh * 16 / 12)";
    document.querySelector(selector).style.maxWidth = "calc(100vw)";

    function handleVideoPlayer(videoElement) {
        console.log('Video player found:', videoElement);
        videoElement.style.maxHeight = "calc(100vh - (65px * 2))";
        videoElement.parentElement.style.removeProperty("padding-bottom");
        document.querySelector(".VideoPage__playerContainer").style.paddingBottom = "53%";
    }

    (function observeDOM() {
        const observer = new MutationObserver((mutations, obs) => {
            const videoElement = document.querySelector(".VideoPage__playerContainer vk-video-player");
            if (videoElement) {
                handleVideoPlayer(videoElement);
                // obs.disconnect(); // Stop observing once the element is found, if a new video player is not loaded later
            }
        });

        observer.observe(document.querySelector(selector), {
            childList: true,
            subtree: true
        });
    })();

})();
