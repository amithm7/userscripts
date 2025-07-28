// ==UserScript==
// @name         Hacker News post favicon
// @namespace    https://amo.fyi
// @version      1.0
// @description  Adds favicons from DDG to posts on Hacker News
// @author       Amith M
// @match        https://*.ycombinator.com/*
// ==/UserScript==

const links = document.querySelectorAll('.titleline > a');

for(let link of links) {
	const domain = new URL(link.href).hostname;
	const imageUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
	const image = document.createElement('img');
	image.src = imageUrl;
	image.style.width = '1em';
	image.style.height = '1em';
	image.style.paddingRight = '.25em';
	image.style.paddingLeft = '.25em';
	link.prepend(image);
}
