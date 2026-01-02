// ==UserScript==
// @name         VK Video Mobile / Desktop Switch Button
// @namespace    https://amo.fyi
// @version      1.3
// @description  Add switch buttons on vk.com video pages to redirect between mobile / desktop
// @author       Amith M
// @match        https://*.vk.com/video*
// @match        https://*.vkvideo.ru/video*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vk.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/vk-video-desktop-mobile-switch.user.js
// @downloadURL  https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/vk-video-desktop-mobile-switch.user.js
// ==/UserScript==

(function () {
	"use strict";

	const desktopShareMenuSelector = ".vkitPostFooter__root--J16mh"; // ".videoplayer_share_actions";
	const mobileShareMenuSelector = ".VideoPageCardActions__root--QTleF"; // "--nKtyl" ".VideoPageCardActions-module__root--ClPQo"

	// TODO: Display notifications on these below actiivites.
	// TODO: Automatic redirect to mobile if video doesn't play in 10s ?
	//
	// if window is focused, wait for 10s, if "._time_current".innerHTML = "0:00", redirect
	// Also check below label, Play /Pause
	// <div class="videoplayer_controls_item videoplayer_btn videoplayer_btn_play" role="button" tabindex="0" aria-label="Play"></div>

	let checkTimeout = null;
	let checkRetries = 0;
	let checkInterval = 1000; // 1s
	let checkMaxRetries = 60;

	const toMobile = `
    <a class="videoplayer_share_action _mobile">
        <div class="videoplayer_share_action_icon">
          <p font-size="24px">M</p>
        </div>
    </a>
    `;

	const toDesktop = `
    <div tabindex="0" role="button" aria-label="desktop" id="desktop-redirect" class="VideoPageCardActions-module__action--jG3g5 vkuiTappable vkuiInternalTappable vkui-focus-visible"
      style="border: 1px white solid;text-align: center;">
      <p font-size="24px" style="margin: 1px auto;width: 30px;">D</p>
    </div>
    `;

	// let getURLWithoutProtocol = (URL) => URL.slice(URL.indexOf("://") + 3);

	let scheduleCheckAgain = () => {
		checkRetries++;

		clearTimeout(checkTimeout);
		if (checkRetries < checkMaxRetries)
			checkTimeout = setTimeout(runCheck, checkInterval);
		else checkRetries = 0;
	};

	let runCheck = () => {
		const host = location.hostname;
		const path = location.pathname + location.search + location.hash;
		const hostParts = host.split(".");

		console.log("checking video player type...");
		if (document.querySelector(desktopShareMenuSelector)) {
			// Desktop Video Player Loaded
			let mobileHost = "";
			if (hostParts.length >= 2) {
				mobileHost =
					hostParts.slice(0, hostParts.length - 2).join(".") +
					(hostParts.length > 2 ? "." : "") +
					"m." +
					hostParts.slice(hostParts.length - 2).join(".");
			} else {
				mobileHost = "m." + host;
			}

			const mobileURL = `${location.protocol}//${mobileHost}${path}`;
			console.log(mobileURL);

			const desktopShareMenuEle = document.querySelector(
				desktopShareMenuSelector
			);
			desktopShareMenuEle.insertAdjacentHTML("afterbegin", toMobile);
			const toMobileAnchor = desktopShareMenuEle.querySelector(
				"a.videoplayer_share_action._mobile"
			);
			toMobileAnchor.href = mobileURL;
			toMobileAnchor.onclick = () => {
				location.href = mobileURL;
			};
		} else if (document.querySelector(mobileShareMenuSelector)) {
			// Mobile Video Player Loaded
			let desktopHost = "";
			if (hostParts.length >= 2) {
				desktopHost = hostParts.reduce((acc, part, index) => {
					// Skip "m." part
					if (part === "m" && index === hostParts.length - 3)
						return acc;
					acc += (acc ? "." : "") + part;
					return acc;
				}, "");
			} else {
				desktopHost = host;
			}

			const desktopURL = `${location.protocol}//${desktopHost}${path}`;
			console.log(desktopURL);

			const anchor = document.createElement("a");
			anchor.href = desktopURL;
			anchor.innerHTML += toDesktop;
			document.querySelector(mobileShareMenuSelector).appendChild(anchor);
			document.getElementById("desktop-redirect").onclick = () => {
				location.href = desktopURL;
			};
		} else {
			scheduleCheckAgain();
		}
	};

	runCheck();
})();
