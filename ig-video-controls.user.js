// ==UserScript==
// @name         Instagram Video controls
// @namespace    https://amo.fyi
// @version      1.1
// @description  Show video controls on instagram
// @author       Amith M
// @match        https://www.instagram.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/ig-video-controls.user.js
// @downloadURL  https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/ig-video-controls.user.js
// ==/UserScript==

// TODO: Consider post pages `/p/*`

(function() {
	'use strict';

	const clarifyVideos = () => {
		const videoElements = document.querySelectorAll('video');

		videoElements.forEach(videoElement => {
			const nextSiblingDiv = videoElement.nextElementSibling;

			if (nextSiblingDiv) {
				nextSiblingDiv.style.display = 'none';

				videoElement.controls = true; // Show playback controls
			}
		});
	}

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(
		// Callback function to execute when mutations are observed
		(mutationList, observer) => {
			for (const mutation of mutationList) {
				// https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord/type
				if (mutation.type === "childList") {
					console.log("A child node has been added or removed.");
					clarifyVideos();
				} else if (mutation.type === "attributes") {
					// console.log(`The ${mutation.attributeName} attribute was modified.`);
				}
			}
		}
	);

	// Start observing the target node for configured mutations
	observer.observe(
		// Target Node: The node that will be observed for mutations
		// document.getElementsByTagName("main")[0],
		// individual posts on the feed page are articles
		// Excludes stories
		document.getElementsByTagName("article")[0].parentElement,
		// Options for the observer (which mutations to observe)
		{ attributes: true, childList: true, subtree: true }
	);

	// Later, you can stop observing
	// observer.disconnect();

})();
