// ==UserScript==
// @name         PriceHistory Redirect Button
// @namespace    https://amo.fyi
// @version      1.3
// @description  Show PriceHistory Redirect (New Tab) Button on Amazon, Flipkart, etc
// @author       Amith M
// @match        https://www.amazon.in/*
// @match        https://www.flipkart.com/*
// @match        https://pricehistoryapp.com/redirect*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pricehistoryapp.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/price-history-direct-button.user.js
// @downloadURL  https://raw.githubusercontent.com/amithm7/userscripts/refs/heads/main/price-history-direct-button.user.js
// ==/UserScript==

(function () {
	"use strict";

	// TODO: Fix FK bug, button gets removed as part of re-render, sometimes?

	//#region helper-functions -------------------------------------------------

	/**
	 * @param {string} searchString URL search string like `?a=1&b=2`
	 * @returns {object} { [query: value], ... }
	 */
	let parseQuery = (searchString) => {
		let query = {};
		let pairs = (
			searchString[0] === "?" ? searchString.substring(1) : searchString
		).split("&");
		for (let i = 0; i < pairs.length; i++) {
			let pair = pairs[i].split("=");
			query[decodeURIComponent(pair[0])] = decodeURIComponent(
				pair[1] || ""
			);
		}
		return query;
	};

	//#endregion helper-functions ----------------------------------------------

	const redirectBtnID = "toPriceHistoryAnchor";

	/**
	 * @typedef site
	 * @type {Object}
	 * @property {string} code - Shop site code
	 * @property {string} CSSSelectorContainer - CSS selector
	 * @property {string} HTMLStringBtnToPH - HTML String
	 * @property {string} HTMLStringAnchorToPH - HTML String
	 */

	/**
	 * @type {site}
	 */
	const AZ = {
		code: "AZ",
		// "#addToCart #corePrice_feature_div .a-section .a-price",
		// ==> PriceBox Inside add to cart box, not always available
		// "#apex_desktop #corePriceDisplay_desktop_feature_div .a-section .a-price",
		// ==> Price box in the center, sub classes change sometimes
		CSSSelectorContainer: "#apex_desktop",
		HTMLStringBtnToPH: `
			<span id="${redirectBtnID}" class="a-button a-padding-mini">
				<p class="" style="font-size: 0.5em;">History</p>
			</span>
			`,
		HTMLStringAnchorToPH: `
			<a id="${redirectBtnID}" class="a-button a-padding-mini"
				href="" target="_blank" rel="noreferrer" rel="noopener"
				style="border: 2px solid yellowgreen; border-radius: 1em; margin: 1em; float: left;">
				<p class="" style="font-size: 1em;">Price History</p>
			</a>
			`,
	};

	/**
	 * @type {site}
	 */
	const FK = {
		code: "FK",
		// PriceInfo
		CSSSelectorContainer: "#price-info-icon",
		HTMLStringBtnToPH: `
			<button id="${redirectBtnID}" class="" style="padding: 0.2em 1em;font-size: 1.9em;margin: 0 1em;">
				<p class="" style="font-size: 0.5em;">History</p>
			</button>
			`,
		HTMLStringAnchorToPH: `
			<a id="${redirectBtnID}" class=""
				href=""  target="_blank" rel="noreferrer" rel="noopener"
				style="padding: 0.3em .3em;font-size: 1.9em;margin: 0 1em; border: 2px solid yellowgreen; border-radius: 1em;">
				<p class="" style="font-size: 0.5em;color: #2874f0;font-weight: 500;">Price History</p>
			</a>
			`,
	};

	const PH_CSSSelectorInSearch = "nav input";
	const PH_CSSSelectorBtnSearch = 'nav button[title="Search Price History"]';

	/**
	 * Compute redirect URL and add button to shop site
	 * @param {site} site
	 */
	let renderBtn = (site) => {
		const HTMLElementContainer = document.querySelector(
			site.CSSSelectorContainer
		);

		const URLStringPHRedirect =
			"https://pricehistoryapp.com/redirect?p=" +
			encodeURIComponent(
				location.protocol +
					"//" +
					location.host +
					location.pathname +
					(site.code == "FK"
						? "?pid=" + parseQuery(location.search).pid
						: "")
			);
		console.log(URLStringPHRedirect);

		// Avoid duplicates
		document.getElementById(redirectBtnID)
			? document.getElementById(redirectBtnID).remove()
			: null;

		// (site.code == "FK"
		// 	? HTMLElementContainer.parentElement.parentElement
		// 	: HTMLElementContainer
		// ).insertAdjacentHTML("beforeend", site.HTMLStringBtnToPH);
		// document.getElementById("${redirectBtnID}").onclick = () => {
		// 	location.href = URLStringPHRedirect;
		// };
		(site.code == "FK"
			? HTMLElementContainer.parentElement.parentElement
			: HTMLElementContainer
		).insertAdjacentHTML("beforeend", site.HTMLStringAnchorToPH);
		document.getElementById(redirectBtnID).href = URLStringPHRedirect;
	};

	/**
	 * @param {site} site
	 */
	let addRedirectBtnToSite = (site) => {
		console.log(`try add ${site.code}`);

		// Observe URL path change for color / type variations
		let oldHref = location.href;
		const observer = new MutationObserver((mutations) => {
			if (oldHref !== location.href) {
				oldHref = location.href;
				renderBtn(site);
			}
		});
		observer.observe(document.querySelector("body"), {
			childList: true,
			subtree: true,
		});

		renderBtn(site);
	};

	let initURLSearch = (productURL) => {
		const PH_HTMLElementInputSearch = document.querySelector(
			PH_CSSSelectorInSearch
		);

		console.log("input URL");

		// window.focus();
		// priceHistorySearchIn.focus();
		// document.querySelector("nav input").value="https://www.amazon.in/dp/B08V98F518/";
		PH_HTMLElementInputSearch.value = productURL;
		// priceHistorySearchIn.click();

		PH_HTMLElementInputSearch.dispatchEvent(
			new Event("input", {
				bubbles: true,
				cancelable: true,
			})
		);

		document.querySelector(PH_CSSSelectorBtnSearch).click();
	};

	let openWLItemsInNewTab = () => {
		document
			.querySelectorAll(
				"#wl-item-view #item-page-wrapper #g-items a[id^='itemName_']"
			)
			.forEach((ele) => {
				ele.target = "_blank";
			});

		const observer = new MutationObserver((mutations) => {
			observer.disconnect();
			openWLItemsInNewTab();
		});
		observer.observe(document.querySelector("#wl-item-view"), {
			childList: true,
			subtree: true,
		});
	};

	if (location.hostname == "www.amazon.in") {
		if (location.pathname.startsWith("/hz/wishlist/ls/")) {
			openWLItemsInNewTab();
		} else {
			addRedirectBtnToSite(AZ);
		}
	} else if (location.hostname == "www.flipkart.com") {
		addRedirectBtnToSite(FK);
	} else if (
		location.hostname == "pricehistoryapp.com" &&
		location.pathname == "/redirect"
	) {
		// Using https://pricehistoryapp.com/redirect?p=PRODUCT_LINK
		initURLSearch(parseQuery(location.search).p);
	}
})();
