import puppeteer from "puppeteer";
import { jsDateToInputString, toInputDate, stringToDate } from "../Common/utils.js";

/**
 * Returns the cumulated IMO DCS voyages consumptions for the given vessel and, optionally, year.
 * It will normally run from 1 Jan of current year until given date, unless the year is also specified
 * @param {string} vesselName
 * @param {Date} date - JavaScript Date object
 * @param {boolean} runFromPrevYear - default false. set to true if to run from previous year
 * @return {Promise<{vessel: string, startDate: string, endDate: string, distance: number, totalHFO: number, totalLFO: number, totalMDO: number, hrsAtSea:number}[]>} Object with results:
 */
export default async function imoDcs(vesselName, date, runFromPrevYear = false) {
	console.time("IMO DCS");
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
		console.log(`Starting IMO DCS data gathering for ${vesselName} for period ${startDate}-${reportDate}...`);

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

		// Navigate to IMO DCS tab
		await new Promise((r) => setTimeout(r, 500));
		await page.keyboard.press("Tab");
		await new Promise((r) => setTimeout(r, 100));
		await page.keyboard.press("Tab");
		await new Promise((r) => setTimeout(r, 100));
		await page.keyboard.press("ArrowRight");
		await new Promise((r) => setTimeout(r, 100));
		await page.keyboard.press("ArrowRight");
		await new Promise((r) => setTimeout(r, 200));
		console.log(`Selected IMO DCS tab`);

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
		await page.waitForSelector("#dtpFromDatedcs");
		await page.type("#dtpFromDatedcs", startDate);
		await new Promise((r) => setTimeout(r, 100));

		// Type To date
		await page.waitForSelector("#dtpToDatedcs");
		await page.type("#dtpToDatedcs", reportDate);
		await new Promise((r) => setTimeout(r, 100));

		// Click Show
		await page.waitForSelector("#btnShow0");
		await page.click("#btnShow0");
		console.log(`Selected interval ${startDate}-${reportDate} and clicked Show. Waiting for results...`);

		await new Promise((r) => setTimeout(r, 200));

		// wait for the page to load results
		await page.waitForSelector("#divMainResultIMO > div > #grdResultIMO > .k-pager-wrap > .k-pager-info");
		let element = await page.$("#divMainResultIMO > div > #grdResultIMO > .k-pager-wrap > .k-pager-info");
		let results = await page.evaluate((el) => el.textContent, element);

		// Check every 3 sec. if it still says "No items to display" at the bottom. If not, move on, means the data is loaded
		//
		let t = 0;
		const timeout = 40; // 3000 ms * 40 = 120 sec. waiting for something to display
		while (results == "No items to display" && t < timeout) {
			await new Promise((r) => setTimeout(r, 3000));
			element = await page.$("#grdResultIMO > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-info.k-label");
			results = await page.evaluate((el) => el.textContent, element);
			t++;
		}

		if (t >= timeout) {
			console.log("No results shown");
			console.timeEnd("IMO DCS");
			await browser.close();
			resolve(null);
		} else {
			console.log(`Results displayed`);

			// Select 500 items per page
			await page.waitForSelector("#grdResultIMO > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-sizes.k-label > span > span > span.k-select");
			await page.click("#grdResultIMO > div.k-pager-wrap.k-grid-pager.k-widget > span.k-pager-sizes.k-label > span > span > span.k-select");
			await new Promise((r) => setTimeout(r, 100));
			await page.keyboard.press("ArrowDown");
			await new Promise((r) => setTimeout(r, 100));
			await page.keyboard.press("ArrowDown");
			await new Promise((r) => setTimeout(r, 100));
			await page.keyboard.press("Enter");
			console.log("Selected 500 items per page");

			// Read consumption values
			// Sea HFO
			await new Promise((r) => setTimeout(r, 300));
			await page.waitForSelector(".k-footer-template > td:nth-child(8) > div > strong > span"); // this is where total HFO is
			element = await page.$(".k-footer-template > td:nth-child(8) > div > strong > span");
			// get the value
			let seaHFO = await page.evaluate((el) => el.textContent, element);
			// eliminate the comma from the value and convert it to number
			seaHFO = seaHFO.replace(",", "");
			seaHFO = Number(seaHFO);

			// Sea LFO
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(9) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(9) > div > strong > span");
			// get the value
			let seaLFO = await page.evaluate((el) => el.textContent, element);
			// eliminate the comma from the value and convert it to number
			seaLFO = seaLFO.replace(",", "");
			seaLFO = Number(seaLFO);

			// Sea MDO
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(10) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(10) > div > strong > span");
			// get the value
			let seaMDO = await page.evaluate((el) => el.textContent, element);
			// eliminate the comma from the value and convert it to number
			seaMDO = seaMDO.replace(",", "");
			seaMDO = Number(seaMDO);

			// Port HFO
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(12) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(12) > div > strong > span");
			// get the value
			let portHFO = await page.evaluate((el) => el.textContent, element);
			// eliminate the comma from the value and convert it to number
			portHFO = portHFO.replace(",", "");
			portHFO = Number(portHFO);

			// Port LFO
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(13) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(13) > div > strong > span");
			// get the value
			let portLFO = await page.evaluate((el) => el.textContent, element);
			// eliminate the comma from the value and convert it to number
			portLFO = portLFO.replace(",", "");
			portLFO = Number(portLFO);

			// Port MDO
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(14) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(14) > div > strong > span");
			// get the value
			let portMDO = await page.evaluate((el) => el.textContent, element);
			// eliminate the comma from the value and convert it to number
			portMDO = portMDO.replace(",", "");
			portMDO = Number(portMDO);

			// Total HFO
			let totalHFO = seaHFO + portHFO;

			// Total LFO
			let totalLFO = seaLFO + portLFO;

			// Total MDO
			let totalMDO = seaMDO + portMDO;

			// Read sailed distance
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(16) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(16) > div > strong > span");
			let distance = await page.evaluate((el) => el.textContent, element);

			// eliminate the comma from the value and convert it to number
			distance = distance.replace(",", "");
			distance = Number(distance);

			// Read time at sea
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(17) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(17) > div > strong > span");
			let hrsAtSea = await page.evaluate((el) => el.textContent, element);

			// eliminate the comma from the value and convert it to number
			hrsAtSea = hrsAtSea.replace(",", "");
			hrsAtSea = Number(hrsAtSea);

			// Read time at anchor
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(18) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(18) > div > strong > span");
			let hrsAtAnchor = await page.evaluate((el) => el.textContent, element);

			// eliminate the comma from the value and convert it to number
			hrsAtAnchor = hrsAtAnchor.replace(",", "");
			hrsAtAnchor = Number(hrsAtAnchor);

			// Read time adrift
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(19) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(19) > div > strong > span");
			let hrsDrifting = await page.evaluate((el) => el.textContent, element);

			// eliminate the comma from the value and convert it to number
			hrsDrifting = hrsDrifting.replace(",", "");
			hrsDrifting = Number(hrsDrifting);

			// Read time adrift
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(20) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(20) > div > strong > span");
			let hrsSteaming = await page.evaluate((el) => el.textContent, element);

			// eliminate the comma from the value and convert it to number
			hrsSteaming = hrsSteaming.replace(",", "");
			hrsSteaming = Number(hrsSteaming);

			// Read time adrift
			await page.waitForSelector("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(21) > div > strong > span");
			element = await page.$("#grdResultIMO > .k-grid-footer > .k-grid-footer-wrap > table > tbody > .k-footer-template > td:nth-child(21) > div > strong > span");
			let hrsInPort = await page.evaluate((el) => el.textContent, element);

			// eliminate the comma from the value and convert it to number
			hrsInPort = hrsInPort.replace(",", "");
			hrsInPort = Number(hrsInPort);

			// Read Date of Arrival of Last Leg (DALL)
			// Go through all legs 1 to 500 and if they exist, get the date of arrival of each leg and keep the last one, since that will be the latest
			let DALL;
			for (let i = 1; i < 500; i++) {
				element = await page.$(`#grdResultIMO > div.k-grid-content > table > tbody > tr:nth-child(${i}) > td:nth-child(7)`);
				if (element) {
					DALL = await page.evaluate((el) => el.textContent, element); // expect DD-MMM-YYYY HH:mm
				}
			}

			// Convert to format DDMMYYYY
			DALL = toInputDate(DALL);
			console.log(`Date of Arrival of Last Leg: ${DALL.slice(0, -6)}.${DALL.slice(2, -4)}.${DALL.slice(4)}`);

			// Some DCS legs will finish after 1st of the current month and DALL could be after
			// In this case, only need to consider DALL until 1 of the month, since DCS data is also only until that date
			// Checking if DALL is later than 1 of the month and if so, consider it only until the 1st
			if (stringToDate(DALL) > stringToDate(reportDate)) {
				DALL = reportDate;
			}

			// Get the date in format DD-MMM-YYYY for record keeping
			let excelDALL = `${DALL.slice(0, -6)}.${DALL.slice(2, -4)}.${DALL.slice(4)}`; // expect DD.MM.YYYY

			console.timeEnd("IMO DCS");
			await browser.close();

			const response = {
				vessel: vesselName,
				startDate: `${startDate.slice(0, -6)}.${startDate.slice(2, -4)}.${startDate.slice(4)}`,
				endDate: `${DALL.slice(0, -6)}.${DALL.slice(2, -4)}.${DALL.slice(4)}`,
				distance,
				seaHFO,
				seaLFO,
				seaMDO,
				portHFO,
				portLFO,
				portMDO,
				totalHFO,
				totalLFO,
				totalMDO,
				hrsAtSea,
				hrsAtAnchor,
				hrsDrifting,
				hrsSteaming,
				hrsInPort,
			};
			resolve(response);
		}
	});
}
