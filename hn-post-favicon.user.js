// ==UserScript==
// @name         Hacker News post favicon
// @namespace    https://amo.fyi
// @version      1.1
// @description  Adds favicons from DDG to posts on Hacker News
// @author       Amith M
// @match        https://*.ycombinator.com/*
// @grant        GM_addElement
// @updateURL    https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/hn-post-favicon.user.js
// @downloadURL  https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/hn-post-favicon.user.js
// ==/UserScript==

const links = document.querySelectorAll('.titleline > a');

for(let link of links) {
	const domain = new URL(link.href).hostname;
	const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    const image = GM_addElement(link, 'img', {
        src: imageUrl,
        style: 'width:1em; height:1em; padding-right:.25em; padding-left:.25em;'
    });
    link.prepend(image);
}
