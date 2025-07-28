// ==UserScript==
// @name         YouTube Video Save To Playlist Search
// @namespace    https://amo.fyi/
// @version      1.1
// @description  Adds a Search field for YouTube Video's Save To playlists.
// @author       Amith M
// @match        *://www.youtube.com/*
// ==/UserScript==

"use strict";

let checkTimeout = null;
let checkRetries = 0;
let checkInterval = 1000; // 1s
let checkMaxRetries = 6;

let saveToWindow = null;
let saveToHeader = null;
let playlists = [];
let playlistSearch = null;

let initSearch = (q) => {
	if (playlists.length === 0) return;

	q = q.trim().toLowerCase();

	playlists.forEach((playlist) => {
		let name = playlist.innerText.toLowerCase();

		if (name.indexOf(q) === -1)
			playlist.style.display = "none";
		else
			playlist.style.display = "";
	});
};

let scheduleCheckAgain = () => {
	checkRetries++;

	clearTimeout(checkTimeout);
	if (checkRetries < checkMaxRetries)
		checkTimeout = setTimeout(checkSaveToWindow, checkInterval);
	else
		checkRetries = 0;
};

let checkSaveToWindow = () => {
	saveToWindow = document.querySelector("ytd-add-to-playlist-renderer");
	saveToHeader = document.querySelector(
		"div#header.ytd-add-to-playlist-renderer"
		// TODO: Work with new title element. Issue: Search Not visible in subsequent clicks
		// "div#title.ytd-add-to-playlist-renderer"
		// "div#header>.ytd-menu-title-renderer.ytd-add-to-playlist-renderer"
	);

	// first click of "Save" btn, saveTo window is added to DOM.
	// subsequent clicks, it may not be rendered / visible.
	// In both cases, rendering takes time. So, check a few times.
	if (!saveToHeader || !saveToHeader.offsetHeight) {
		scheduleCheckAgain();
		return;
	}

	playlists = document.querySelectorAll(
		"ytd-playlist-add-to-option-renderer"
	);

	if (playlistSearch) {
		playlistSearch.select();
		return;
	}

	saveToWindow
		.querySelectorAll("#playlists #label.ytd-playlist-add-to-option-renderer")
		.forEach((e) => {
			e.setAttribute("style", "font-family: monospace !important");
		});

	playlistSearch = document.createElement("input");
	playlistSearch.id = "playlist-search";
	playlistSearch.type = "search";
	saveToHeader.appendChild(playlistSearch);

	playlistSearch.addEventListener("keyup", (e) =>
		initSearch(e.target.value)
	);

	playlistSearch.focus();

	// prevent clicks inside saveTo window from triggering focus of the search.
	saveToWindow.addEventListener("click", (e) => {
		e.stopPropagation();
	});
};

document.addEventListener("click", checkSaveToWindow);
