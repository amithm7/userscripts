// ==UserScript==
// @name         PriceHistory Redirect Button
// @namespace    https://amo.fyi
// @version      1.0
// @description  Show PriceHistory Redirect (New Tab) Button on Amazon, Flipkart, etc
// @author       Amith M
// @match        https://www.amazon.in/*
// @match        https://www.flipkart.com/*
// @match        https://pricehistoryapp.com/redirect*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pricehistoryapp.com
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	// TODO: Fix FK bug, button gets removed as part of re-render, sometimes?

	//#region helper-functions -------------------------------------------------

	let checkTimeout = null;
	let checkRetries = 0;
	let checkInterval = 1000; // 1s
	let checkMaxRetries = 60;

	let scheduleCheckAgain = (checkFunction) => {
		checkRetries++;

		clearTimeout(checkTimeout);
		if (checkRetries < checkMaxRetries) {
			checkTimeout = setTimeout(checkFunction, checkInterval);
		} else {
			checkRetries = 0;
		}
	};

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

	const AZ = {
		code: "AZ",
		// PriceBox Inside add to cart box, not always available
		// CSSSelectorContainer:
		// 	"#addToCart #corePrice_feature_div .a-section .a-price",
		// PriceBox
		CSSSelectorContainer:
			"#apex_desktop #corePriceDisplay_desktop_feature_div .a-section .a-price",
		HTMLStringBtnToPH: `
			<span id="toPriceHistoryBtn" class="a-button a-padding-mini">
				<p class="" style="font-size: 0.5em;">History</p>
			</span>
			`,
		HTMLStringAnchorToPH: `
			<a id="toPriceHistoryAnchor" class="a-button a-padding-mini"
				href="" target="_blank" rel="noreferrer" rel="noopener"
				style="border: 2px solid yellowgreen; border-radius: 1em;">
				<p class="" style="font-size: 0.5em;">History</p>
			</a>
			`,
	};

	const FK = {
		code: "FK",
		// PriceInfo
		CSSSelectorContainer: "#price-info-icon",
		HTMLStringBtnToPH: `
			<button id="toPriceHistoryBtn" class="" style="padding: 0.2em 1em;font-size: 1.9em;margin: 0 1em;">
				<p class="" style="font-size: 0.5em;">History</p>
			</button>
			`,
		HTMLStringAnchorToPH: `
			<a id="toPriceHistoryAnchor" class=""
				href=""  target="_blank" rel="noreferrer" rel="noopener"
				style="padding: 0.3em .3em;font-size: 1.9em;margin: 0 1em; border: 2px solid yellowgreen; border-radius: 1em;">
				<p class="" style="font-size: 0.5em;">History</p>
			</a>
			`,
	};

	const PH_CSSSelectorInSearch = "nav input";
	const PH_CSSSelectorBtnSearch = 'nav button[title="Search Price History"]';

	let tryAddRedirectBtn = (site) => {
		console.log(`try add ${site.code}`);
		const HTMLElementContainer = document.querySelector(
			site.CSSSelectorContainer
		);
		if (HTMLElementContainer) {
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

			// (site.code == "FK"
			// 	? HTMLElementContainer.parentElement.parentElement
			// 	: HTMLElementContainer
			// ).insertAdjacentHTML("beforeend", site.HTMLStringBtnToPH);
			// document.getElementById("toPriceHistoryBtn").onclick = () => {
			// 	location.href = URLStringPHRedirect;
			// };
			(site.code == "FK"
				? HTMLElementContainer.parentElement.parentElement
				: HTMLElementContainer
			).insertAdjacentHTML("beforeend", site.HTMLStringAnchorToPH);
			document.getElementById("toPriceHistoryAnchor").href =
				URLStringPHRedirect;
		} else {
			scheduleCheckAgain(() => tryAddRedirectBtn(site));
		}
	};

	let initURLSearch = (productURL) => {
		const PH_HTMLElementInputSearch = document.querySelector(
			PH_CSSSelectorInSearch
		);
		if (PH_HTMLElementInputSearch) {
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
		} else {
			scheduleCheckAgain(() => initURLSearch(productURL));
		}
	};

	if (location.hostname == "www.amazon.in") {
		tryAddRedirectBtn(AZ);
	} else if (location.hostname == "www.flipkart.com") {
		tryAddRedirectBtn(FK);
	} else if (
		location.hostname == "pricehistoryapp.com" &&
		location.pathname == "/redirect"
	) {
		// Using https://pricehistoryapp.com/redirect?p=PRODUCT_LINK
		console.log(location.hostname + location.pathname);

		initURLSearch(parseQuery(location.search).p);
	}
})();
