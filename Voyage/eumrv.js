import puppeteer from "puppeteer";
import { jsDateToInputString, toInputDate } from "../Common/utils.js";

// TODO leg object type
/**
 * Returns the cumulated EU MRV voyages consumptions for the given vessel and, optionally, year.
 * It will normally run from 1 Jan of current year until given date, unless the year is also specified
 * @param {string} vesselName
 * @param {Date} date - JavaScript Date object
 * @param {boolean} runFromPrevYear - default false. set to true if to run from previous year
 * @return {Promise<{vessel: string, startDate: string, endDate: string, legs: Object[]}>} Object with results
 */
export default async function eumrv(vesselName, date, runFromPrevYear = false) {
	console.time("EU MRV");

	// Substract 2 days from date to ensure that the EU MRV data is available
	date.setDate(date.getDate() - 2);

	return new Promise(async (resolve, error) => {
		// check argument validity
		if (typeof date !== "object") throw new Error("Invalid date argument. Only JavaScript Date objects are accepted.");
		if (!(new Date("1971-01-01") < date) || !(date < new Date("2050-01-01"))) throw new Error("Invalid date argument. Only JavaScript Date objects are accepted.");
		if (typeof runFromPrevYear !== "boolean") throw new Error("Invalid runFromPrevYear argument. Only boolean values are accepted.");

		const browser = await puppeteer.launch({ headless: "new" }); // for running in Node.js
		// const browser = await puppeteer.launch({ executablePath: "./chromium/chrome.exe", headless: false }); // for .exe packages
		const page = await browser.newPage();

		let startDate; // report start date, normally 1 Jan
		let reportDate; // normally 1 of the current month

		reportDate = jsDateToInputString(date);
		const year = date.getFullYear();

		// if required to run from previous year, set start date to 1 Jan previous year, else 1 Jan this year
		if (runFromPrevYear) startDate = `0101${year - 1}`;
		else startDate = `0101${year}`;

		// override default timeout of 30000
		page.setDefaultNavigationTimeout(60000);
		console.log(`Starting EU MRV data gathering for ${vesselName} for period ${startDate}-${reportDate}...`);

		const navigationPromise = page.waitForNavigation();

		// Go to login page
		await page.goto(`${this.url}/palweblogin/Home/Login`);

		await page.setViewport({ width: 1920, height: 900 });

		await navigationPromise;
		console.log(`Opened ${this.url}/palweblogin/Home/Login`);

		// Enter PAL credentials
		await page.waitForSelector("#UserName");
		await page.type("#UserName", this.user);
		await page.type("#Password", this.password);
		await new Promise((r) => setTimeout(r, 100));

		await navigationPromise;

		await new Promise((r) => setTimeout(r, 200));

		await page.waitForSelector("#btnSubmit");
		await page.click("#btnSubmit");

		console.log("Logged in");

		// wait 2500ms for Dashboard to load
		await new Promise((r) => setTimeout(r, 2500));

		// Go to EUMRV page
		await page.goto(`${this.url}/palvoyage/VoyagePAL/EUMRVLogReport`);
		console.log(`Opened EUMRV Log Report page`);

		// Select the vessel
		await page.waitForSelector("#DivPerformanceOverView > #divHeader > table > tbody > tr > .bsm-common-content");
		await page.click("#DivPerformanceOverView > #divHeader > table > tbody > tr > .bsm-common-content");
		await page.keyboard.press("Tab");
		await new Promise((r) => setTimeout(r, 200));
		await page.keyboard.type(vesselName);
		await new Promise((r) => setTimeout(r, 1500));
		await page.keyboard.press("ArrowDown");
		await new Promise((r) => setTimeout(r, 500));
		await page.keyboard.press("Enter");
		await new Promise((r) => setTimeout(r, 300));
		console.log(`Selected ${vesselName}`);

		// Type From date
		await page.waitForSelector("#dtpFromDate");
		await page.type("#dtpFromDate", startDate);
		await new Promise((r) => setTimeout(r, 100));

		// Type To date
		await page.waitForSelector("#dtpToDate");
		await page.type("#dtpToDate", reportDate);
		await new Promise((r) => setTimeout(r, 100));

		// Click Show
		await page.waitForSelector("#btnShow");
		await page.click("#btnShow");

		console.log(`Selected interval ${startDate}-${reportDate} and clicked Show. Waiting for results...`);

		await new Promise((r) => setTimeout(r, 200));

		// wait for the page to load results. If not loaded
		await page.waitForSelector("#grdResult > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-info.k-label");
		let element = await page.$("#grdResult > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-info.k-label");
		let results = await page.evaluate((el) => el.textContent, element);

		// Check every 3 sec. if it still says "No items to display" at the bottom. If not, move on, means the data is loaded
		//
		let t = 0;
		let timeout = 40; // 3000 ms * 40 = 120 sec. waiting for something to display
		while (results == "No items to display" && t < timeout) {
			await new Promise((r) => setTimeout(r, 3000));
			element = await page.$("#grdResult > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-info.k-label");
			results = await page.evaluate((el) => el.textContent, element);
			t++;
		}

		if (t >= timeout) {
			console.log("No results shown");
			console.timeEnd("EU MRV");
			await browser.close();
			resolve(null);
		} else {
			console.log(`Results displayed`);

			// Select 500 items per page
			await page.waitForSelector("#grdResult > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-sizes.k-label > span > span > span.k-select");
			await page.click("#grdResult > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-sizes.k-label > span > span > span.k-select");
			await new Promise((r) => setTimeout(r, 100));
			await page.keyboard.press("ArrowDown");
			await new Promise((r) => setTimeout(r, 100));
			await page.keyboard.press("ArrowDown");
			await new Promise((r) => setTimeout(r, 100));
			await page.keyboard.press("Enter");
			console.log("Selected 500 items per page");

			let legs = [];
			// Iterage through all legs 1 to 500
			for (let i = 1; i <= 500; i++) {
				const legElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(2)`);
				const depPortElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`);
				const depCountryElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(4)`);
				const depTimeElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`);
				const arrPortElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(6)`);
				const arrCountryElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(7)`);
				const arrTimeElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(8)`);
				const seaHFOconsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(9)`);
				const seaHFOCO2element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(10)`);
				const seaLFOconsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(11)`);
				const seaLFOCO2element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(12)`);
				const seaMDOconsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(13)`);
				const seaMDOCO2element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(14)`);
				const seaTotalConsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(15)`);
				const seaTotalCO2element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(16)`);
				const portHFOconsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(17)`);
				const portHFOCO2Element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(18)`);
				const portLFOconsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(19)`);
				const portLFOCO2Element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(20)`);
				const portMDOconsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(21)`);
				const portMDOCO2Element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(22)`);
				const portTotalConsElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(23)`);
				const portTotalCO2element = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(24)`);
				const distanceElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(25)`);
				const timeAtSeaElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(26)`);
				const timeAtAnchorageElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(27)`);
				const timeDriftingElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(28)`);
				const timeNavigationElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(29)`);
				const timeSteamingElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(30)`);
				const cargoElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(31)`);
				const transportworkElement = await page.$(`#grdResult > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(32)`);

				// if leg exists, read the data in the HTML elements
				if (legElement) {
					var voyageLeg = await page.evaluate((el) => el.textContent, legElement);
					var depPort = await page.evaluate((el) => el.textContent, depPortElement);
					var depCountry = await page.evaluate((el) => el.textContent, depCountryElement);
					var depTime = await page.evaluate((el) => el.textContent, depTimeElement);
					var arrPort = await page.evaluate((el) => el.textContent, arrPortElement);
					var arrCountry = await page.evaluate((el) => el.textContent, arrCountryElement);
					var arrTime = await page.evaluate((el) => el.textContent, arrTimeElement);
					// DALL will keep arrival date of last leg
					var DALL = arrTime;
					var seaHFOcons = await page.evaluate((el) => el.textContent, seaHFOconsElement);
					seaHFOcons = seaHFOcons.replaceAll(",", "");
					seaHFOcons = Number(seaHFOcons);
					var seaHFOCO2 = await page.evaluate((el) => el.textContent, seaHFOCO2element);
					seaHFOCO2 = seaHFOCO2.replaceAll(",", "");
					seaHFOCO2 = Number(seaHFOCO2);
					var seaLFOcons = await page.evaluate((el) => el.textContent, seaLFOconsElement);
					seaLFOcons = seaLFOcons.replaceAll(",", "");
					seaLFOcons = Number(seaLFOcons);
					var seaLFOCO2 = await page.evaluate((el) => el.textContent, seaLFOCO2element);
					seaLFOCO2 = seaLFOCO2.replaceAll(",", "");
					seaLFOCO2 = Number(seaLFOCO2);
					var seaMDOcons = await page.evaluate((el) => el.textContent, seaMDOconsElement);
					seaMDOcons = seaMDOcons.replaceAll(",", "");
					seaMDOcons = Number(seaMDOcons);
					var seaMDOCO2 = await page.evaluate((el) => el.textContent, seaMDOCO2element);
					seaMDOCO2 = seaMDOCO2.replaceAll(",", "");
					seaMDOCO2 = Number(seaMDOCO2);
					var seaTotalCons = await page.evaluate((el) => el.textContent, seaTotalConsElement);
					seaTotalCons = seaTotalCons.replaceAll(",", "");
					seaTotalCons = Number(seaTotalCons);
					var seaTotalCO2 = await page.evaluate((el) => el.textContent, seaTotalCO2element);
					seaTotalCO2 = seaTotalCO2.replaceAll(",", "");
					seaTotalCO2 = Number(seaTotalCO2);
					var portHFOcons = await page.evaluate((el) => el.textContent, portHFOconsElement);
					portHFOcons = portHFOcons.replaceAll(",", "");
					portHFOcons = Number(portHFOcons);
					var portHFOCO2 = await page.evaluate((el) => el.textContent, portHFOCO2Element);
					portHFOCO2 = portHFOCO2.replaceAll(",", "");
					portHFOCO2 = Number(portHFOCO2);
					var portLFOcons = await page.evaluate((el) => el.textContent, portLFOconsElement);
					portLFOcons = portLFOcons.replaceAll(",", "");
					portLFOcons = Number(portLFOcons);
					var portLFOCO2 = await page.evaluate((el) => el.textContent, portLFOCO2Element);
					portLFOCO2 = portLFOCO2.replaceAll(",", "");
					portLFOCO2 = Number(portLFOCO2);
					var portMDOcons = await page.evaluate((el) => el.textContent, portMDOconsElement);
					portMDOcons = portMDOcons.replaceAll(",", "");
					portMDOcons = Number(portMDOcons);
					var portMDOCO2 = await page.evaluate((el) => el.textContent, portMDOCO2Element);
					portMDOCO2 = portMDOCO2.replaceAll(",", "");
					portMDOCO2 = Number(portMDOCO2);
					var portTotalCons = await page.evaluate((el) => el.textContent, portTotalConsElement);
					portTotalCons = portTotalCons.replaceAll(",", "");
					portTotalCons = Number(portTotalCons);
					var portTotalCO2 = await page.evaluate((el) => el.textContent, portTotalCO2element);
					portTotalCO2 = portTotalCO2.replaceAll(",", "");
					portTotalCO2 = Number(portTotalCO2);
					var distance = await page.evaluate((el) => el.textContent, distanceElement);
					distance = distance.replaceAll(",", "");
					distance = Number(distance);
					var timeAtSea = await page.evaluate((el) => el.textContent, timeAtSeaElement);
					timeAtSea = timeAtSea.replaceAll(",", "");
					timeAtSea = Number(timeAtSea);
					var timeAtAnchorage = await page.evaluate((el) => el.textContent, timeAtAnchorageElement);
					timeAtAnchorage = timeAtAnchorage.replaceAll(",", "");
					timeAtAnchorage = Number(timeAtAnchorage);
					var timeDrifting = await page.evaluate((el) => el.textContent, timeDriftingElement);
					timeDrifting = timeDrifting.replaceAll(",", "");
					timeDrifting = Number(timeDrifting);
					var timeNavigation = await page.evaluate((el) => el.textContent, timeNavigationElement);
					timeNavigation = timeNavigation.replaceAll(",", "");
					timeNavigation = Number(timeNavigation);
					var timeSteaming = await page.evaluate((el) => el.textContent, timeSteamingElement);
					timeSteaming = timeSteaming.replaceAll(",", "");
					timeSteaming = Number(timeSteaming);
					var cargo = await page.evaluate((el) => el.textContent, cargoElement);
					cargo = cargo.replace(",", "");
					cargo = Number(cargo);
					var transportwork = await page.evaluate((el) => el.textContent, transportworkElement);
					transportwork = transportwork.replaceAll(",", "");
					transportwork = Number(transportwork);

					// push the leg to legs array
					legs.push({
						voyageLeg,
						depPort,
						depCountry,
						depTime,
						arrPort,
						arrCountry,
						arrTime,
						seaHFOcons,
						seaHFOCO2,
						seaLFOcons,
						seaLFOCO2,
						seaMDOcons,
						seaMDOCO2,
						seaTotalCons,
						seaTotalCO2,
						portHFOcons,
						portHFOCO2,
						portLFOcons,
						portLFOCO2,
						portMDOcons,
						portMDOCO2,
						portTotalCons,
						portTotalCO2,
						distance,
						timeAtSea,
						timeAtAnchorage,
						timeDrifting,
						timeNavigation,
						timeSteaming,
						cargo,
						transportwork,
					});
				}
			}

			// convert to DDMMYYYY
			DALL = toInputDate(DALL);

			console.timeEnd("EU MRV");
			await browser.close();

			const response = {
				vessel: vesselName,
				startDate: `${startDate.slice(0, -6)}.${startDate.slice(2, -4)}.${startDate.slice(4)}`,
				endDate: `${DALL.slice(0, -6)}.${DALL.slice(2, -4)}.${DALL.slice(4)}`,
				legs,
			};
			resolve(response);
		}
	});
}
