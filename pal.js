import axios from "axios";
import FormData from "form-data";
import puppeteer from "puppeteer";
import qs from "qs";
import { getCookie, usersToIdAndUserName, vesselNamesToIds, vesselNamesToObjectIds } from "./Common/index.js";
import { addCrewAllocation, crewAllocation, getAllocatedUsers, getCrewingProcesses, getCrewingRoles, removeCrewingAllocation } from "./Crewing/index.js";
import {
	categoriesNamesToIds,
	generalQuery,
	getCurrentPRCallocation,
	getPRCcycleTemplateIds,
	getPurchaseCategories,
	getUsers,
	getVessels,
	isPRCallocSuccessful,
	purchaseAllocation,
} from "./Purchase/index.js";
import { getPSCreports } from "./QHSE/index.js";
import { getVesselSchedule, getVoyAlertRoles, voyageAlertConfig } from "./Voyage/index.js";
import { dateToString, jsDateToInputString, stringToDate, toInputDate } from "./utils.js";

/**
 * Class with all PAL e3 API call methods
 */
export default class PALAPI {
	/**
	 * ERP URL without the trailing comma
	 * Example: https://palapp.apn-narisine.com
	 * @type {string}
	 */
	url;
	/**
	 * The ERP login user
	 * @type {string}
	 */
	user;
	/**
	 * The ERP login user password
	 * @type {string}
	 */
	password;
	/**
	 * .BSMAuthCookie session cookie used in API calls
	 * @type {string}
	 */
	cookie;
	/**
	 * cached users
	 * @type {string[]}
	 */
	cachedUsers;
	/**
	 * cached vessels
	 * @type {string[]}
	 */
	cachedVessels;

	/**
	 * Logs in to PAL using provided credentials, retrieves the session cookie and sets the cookie property
	 */
	getCookie() {
		return getCookie.call(this);
	}

	/**
	 * Gets all the vessels' port call schedule for the next month
	 * @param {days} days how many days ahead to check
	 * @return {Promise<Array>} Array of objects, each containing a port call
	 */
	getVesselSchedule(days) {
		return getVesselSchedule.call(this, days);
	}

	// TODO TS type definitions
	/**
	 * Gets PAL Purchase documents from General Query
	 * @param {Array} vessels Array of vessel names: ["CHEM MIA", "CHEM ZEALOT"]
	 * @param {number} year
	 * @param {number} docType Requisition: 1, PO: 4
	 * @param {Array} categories Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @returns {Promise<{DocId:number,DocCode:string,DocNo:string,RequsitionId:number,RequsitionCode:string,RequsitionTitle:string,RequsitionStatus:string|null }[]>} Array of objects, each containing a document
	 */
	generalQuery(vessels, year, docType, categories) {
		return generalQuery.call(this, vessels, year, docType, categories);
	}

	/**
	 * Gets all the PSC reports available in PAL
	 * @return {Promise<{  Id: number,ReportTypeId: number,ReportType: string,ReportSubTypeId: number,ReportSubType: string,RefNo: string,InspectionDate: string,InspectorName: string,UnitType:string,Unit:string,VesselStatus:string,NoOfDeficiencies:number, NoOfOpenDeficiencie:number, Status:string,Result:string, pscmou:string, ReportStatus:string,StatusDate:string, Port:string}[]>} Array of objects, each containing an inspection report
	 */
	getPSCreports() {
		return getPSCreports.call(this);
	}

	/**
	 * Gets all the vessels in PAL
	 * @return {Promise<{Id: number,VesselId: number,VesselObjectId: number,VesselName: string,ApprovalCycleTemplateId: number,ApprovalTemplateId: number,StopProcess: boolean,ModifiedById: number,ModifiedOn: string,IsSelected: boolean,SNo: number}[]>} Array of vessel objects
	 */
	getVessels() {
		return getVessels.call(this);
	}

	/**
	 * Transforms an array of vessel names to a string of VesselObjectIds to be used in other methods
	 * @private
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of VesselObjectIds as string: "246049,246026"
	 */
	vesselNamesToObjectIds(vesselsArray) {
		return vesselNamesToObjectIds.call(this, vesselsArray);
	}

	/**
	 * Transforms an array of vessel names to a string of VesselIds to be used in other methods
	 * @private
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of VesselIds as string: "246049,246026"
	 */
	vesselNamesToIds(vesselsArray) {
		return vesselNamesToIds.call(this, vesselsArray);
	}

	/**
	 * Gets all the vessels in PAL
	 * @param {string} docType "PROC" or "JOB"
	 * @return {Promise<{Selected: boolean, Text: string, Value: string}[]>} Array of objects, each containing a Purchase category
	 * @example [{"Selected":false,"Text":"MEDICINE","Value":"201205"},{"Selected":false,"Text":"PROVISIONS","Value":"201184"}]
	 */
	getPurchaseCategories(docType) {
		return getPurchaseCategories.call(this, docType);
	}

	/**
	 * Transforms an array of Purchase categories names to a string of IDs to be used in other methods
	 * @private
	 * @param {array} Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @param {string} docType "PROC" or "JOB"
	 * @return {Promise<string>} List of Ids as string: "201205,201184"
	 */
	categoriesNamesToIds(categoriesArray, docType) {
		return categoriesNamesToIds.call(this, categoriesArray, docType);
	}

	/**
	 * Replace user allocation for one category, on one vessel
	 * @param {string} docType "PROC" or "JOB"
	 * @param {string} vessel String with vessel name
	 * @param {string} category Name of Purchase category
	 * @param {string} role Name of Purchase role
	 * @param {Array<string>} users Array of users to be assigned to the role
	 * @param {string} template Name of Cycle Template. Needed only for document type JOB
	 * @return {Promise<boolean>} If succesful or not
	 */
	purchaseAllocation(docType, vessel, category, role, users, template) {
		return purchaseAllocation.call(this, docType, vessel, category, role, users, template);
	}

	/**
	 * Gets all the Purchase users in PAL
	 * @return {Promise<{UserId: number, LoginName: string, Name: string, Active: boolean, CompanyId: number, Email: string, SelectedUser: boolean, SNo: number}[]>} Array of objects, each containing a user
	 */
	getUsers() {
		return getUsers.call(this);
	}

	/**
	 * Transforms an array/string of usernames to a string of Ids to be used in other allocation methods
	 * @private
	 * @param {Array<string>} usr String or array of users names: ["Bogdan", "Helen"]
	 * @return {Promise<{id: string, username: string}>} Object with 2 strings: {id: "110531,489954", username: "Bogdan Lazar, Lidia Haile"}
	 */
	usersToIdAndUserName(usr) {
		return usersToIdAndUserName.call(this, usr);
	}

	/**
	 * Get the current Purchase allocation
	 * @param {string} docType "PROC" or "JOB"
	 * @param {number} vesselId VesselId
	 * @param {number} vesselObjectId VesselObjectId
	 * @param {number} categoryId CategoryId
	 * @return {Promise<{ApprovalCycleTemplateId: number, ApprovalTemplateId: number, VesselAllocationId: number, roles: {Id: number, Code: string, Name: string, UserIds: string, UserNames: string,}[]}>}
	 */
	getCurrentPRCallocation(docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId = "") {
		return getCurrentPRCallocation.call(this, docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId);
	}

	/**
	 * Validate the reponse to check if the PRC allocation was succesful
	 * @private
	 * @param {string} docType
	 * @param {number} ApprovalCycleTemplateId
	 * @param {number} ApprovalTemplateId
	 * @param {number} RoleId
	 * @param {string} UserIds
	 * @param {number} VesselAllocationId
	 * @param {number} vesselId
	 * @param {number} vesselObjectId
	 * @param {string} categoryId
	 * @return {Promise<boolean>}
	 */
	isPRCallocSuccessful(docType, ApprovalCycleTemplateId, ApprovalTemplateId, RoleId, UserIds, VesselAllocationId, vesselId, vesselObjectId, categoryId) {
		return isPRCallocSuccessful.call(
			this,
			docType,
			ApprovalCycleTemplateId,
			ApprovalTemplateId,
			RoleId,
			UserIds,
			VesselAllocationId,
			vesselId,
			vesselObjectId,
			categoryId
		);
	}

	/**
	 * Get the IDs of all the cycle templates
	 * @private
	 * @return {Promise<{ Id: number, Name: string, CompanySel: string }[]>}
	 */
	getPRCcycleTemplateIds() {
		return getPRCcycleTemplateIds.call(this);
	}

	/**
	 * Replace current Voyage User Alert Configuration
	 * @param {string} vessel
	 * @param {string} role
	 * @param {string | string[]} users
	 * @return {Promise<boolean>} success or not
	 */
	voyageAlertConfig(vessel, role, users) {
		return voyageAlertConfig.call(this, vessel, role, users);
	}

	/**
	 * Get all the Voyage alert roles
	 * @private
	 * @param {number} vslId
	 * @param {number} vslObjectId
	 * @return {Promise<{VessleId:number,VessleObjectId:number,AlertRoleName:string,AlertRoleId:number,UserIds:string,UserNames:string}[]>} Array of Voyage alert role objects
	 */
	getVoyAlertRoles(vslId, vslObjectId) {
		return getVoyAlertRoles.call(this, vslId, vslObjectId);
	}

	/**
	 * Add user to MDM Crewing Vessel User Allocation
	 * @private
	 * @param {number} roleId
	 * @param {number} userIds
	 * @param {string} userName
	 * @param {number} vslId
	 * @param {number} vslObjectId
	 * @param {number} processId
	 * @return {Promise<boolean>} success or not
	 */
	addCrewAllocation(roleId, userIds, userName, vslId, vslObjectId, processId) {
		return addCrewAllocation.call(this, roleId, userIds, userName, vslId, vslObjectId, processId);
	}

	/**
	 * Get all the Crewing processes and their IDs
	 * @private
	 * @return {Promise<Object[]>} Array of Voyage alert role objects
	 */
	getCrewingProcesses() {
		return getCrewingProcesses.call(this);
	}

	/**
	 * Get the Crewing roles for the given vessel and Crewing process
	 * @private
	 * @param {number} VesselId
	 * @param {number} VesselObjectId
	 * @param {number} processId
	 * @return {Promise<Object[]>} Array of Voyage alert role objects
	 */
	getAllocatedUsers(VesselId, VesselObjectId, processId) {
		return getAllocatedUsers.call(this, VesselId, VesselObjectId, processId);
	}

	/**
	 * Remove MDM Crewing user from given fid
	 * @private
	 * @param {number} fid
	 * @return {Promise<boolean>} success or not
	 */
	async removeCrewingAllocation(fid) {
		return removeCrewingAllocation.call(this, fid);
	}

	/**
	 * Replace current Crew process allocation for the vessel and role
	 * @param {string} vessel
	 * @param {string} process
	 * @param {string} role
	 * @param {string | Array<string>} inputUsers Users not in the array will be removed
	 * @return {Promise<boolean>} success or not
	 */
	async crewAllocation(vessel, process, role, inputUsers) {
		return crewAllocation.call(this, vessel, process, role, inputUsers);
	}

	/**
	 * Gets all the roles in Crewing
	 * @return {Promise<{Id: number,Code: string,Name: 'string,RoleLevel: number,Active: boolean,Is_Active: boolean,}[]>} Array of objects, each containing a role
	 */
	async getCrewingRoles() {
		return getCrewingRoles.call(this);
	}

	/**
	 * Returns the cumulated IMO DCS voyages consumptions for the given vessel and, optionally, year.
	 * It will normally run from 1 Jan of current year until given date, unless the year is also specified
	 * @param {string} vesselName
	 * @param {Date} date - JavaScript Date object
	 * @param {boolean} runFromPrevYear - default false. set to true if to run from previous year
	 * @return {Promise<{vessel: string, startDate: string, endDate: string, distance: number, totalHFO: number, totalLFO: number, totalMDO: number}>} Object with results:
	 */
	async imoDcs(vesselName, date, runFromPrevYear = false) {
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

	/**
	 * Gets all the vessels in PAL
	 * @param {string[]} vessels Array of vessel names
	 * @param {Date} date JS date object. Probably today()
	 * @param {number} daysAhead how many days to look ahead
	 * @param {number[]} ranks array of codes representing the ranks 1 - CPT, 31 - C/E
	 * @return {Promise<Array>} Array of objects, each containing a crew change
	 */
	async getPlannedCrewChanges(vessels, date, daysAhead, ranks) {
		console.time(`Crew planning request`);

		let daysFromNow = date.getDate() + daysAhead;

		// initialize as today and add daysAhead
		let toDate = new Date();
		toDate.setDate(daysFromNow);

		let data = {
			sort: "",
			page: 1,
			pageSize: 1000,
			group: "",
			filter: "",
			ownersArray: "",
			"sdcsArray[]": 1,
			ownersArray: "",
			fromDate: dateToString(date),
			toDate: dateToString(toDate),
			workGroupArray: "",
			rankArray: "",
			vslSubGroupArray: "",
			vslTypeArray: "",
			IsReliefDue: "true",
			Days: 12,
			ShowFullName: "Y",
			IsReliefDue: "true",
			IsMonths: "P",
			isShowClicked: "true",
			isShowClickedPageSize: "true",
			ExcludePlanned: "false",
			CheckLineUpCandidate: "N",
			CheckIncludeOnboard: "N",
			isMISRank: "N",
			ApprovedPlansOnly: "N",
			PendingPlansOnly: "N",
		};

		let vesselObjectIds = await this.vesselNamesToObjectIds(vessels);
		vesselObjectIds = vesselObjectIds.split(",");

		data = qs.stringify(data);

		// add vessels ObjectIds
		for (let vessel of vesselObjectIds) {
			data += `&vesselArray[]=${vessel}&commonVesselArray[]=${vessel}`;
		}

		// add ranks
		for (let rank of ranks) {
			data += `&rankGrpArray[]=${rank}`;
		}

		let options = {
			method: "POST",
			url: `${this.url}/palcrewing/CrewingPAL/Plan/GetCrewListForPlan`,
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: data,
		};

		let response = await axios.request(options);
		console.timeEnd(`Crew planning request`);
		console.log(`Returned ${response.data.Total} results`);

		const results = response.data.Data;

		// console.log(results);

		let responseArray = [];

		for (const r of results) {
			// TODO get reliever details based on `RelieverEmpId`
			const relieverContacts = await this.getSeafarerContacts(r.RelieverEmpId);

			responseArray.push({
				vessel: r.Vessel,
				rank: r.Rank,
				offName: r.Offsigner,
				offDueDate: r.ReliefDue.slice(0, 11),
				plannedRelief: r.PlannedRelief,
				onName: r.Reliever,
				onPhone: relieverContacts.phone, //
				onMobile: relieverContacts.mobile, //
				onEmail: relieverContacts.email, //
				onSkype: relieverContacts.skype,
				onJoinDate: r.ExpJoiningDate,
				port: r.PlannedPort,
				remarks: r.RelieverRemarks,
				onCrewAgent: r.CscExt,
				offCrewAgent: r.oFF_CscExt,
			});
		}
		return responseArray;
	}

	/**
	 * Gets some seafarer contact details based on employee ID (internal code)
	 * @param {number} empId employee ID
	 * @return {Promise<Object>} Seafarer object with contact details
	 */
	async getSeafarerContacts(empId) {
		let data = {
			EmpId: empId,
			localLang: "N",
		};

		let options = {
			method: "POST",
			url: `${this.url}/palcrewing/CrewingPAL/Address/PopulateData`,
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: qs.stringify(data),
		};

		let response = await axios.request(options);
		const results = {
			email: response.data.Email,
			phone: response.data.PPhone1Code + response.data.PPhone1,
			mobile: response.data.PMobileCode + response.data.PMobile,
			address: response.data.PAddress1 + response.data.PCity,
			skype: response.data.SkypeOrIm,
		};

		return results;
	}

	/**
	 * Get all the drills for given vessel from PAL QHSE
	 * @param {string} vesselName vessel name
	 * @return {Promise<Object[]>} Array of drill objects
	 */
	async getDrills(vesselName) {
		console.time("Drills POST request");

		const vesselId = await this.vesselNamesToIds(vesselName);

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("RefNo", "");
		bodyFormData.append("VesselIds", vesselId);
		bodyFormData.append("unitId", "");
		bodyFormData.append("CompanyId", "");
		bodyFormData.append("CategoryId", 1);
		bodyFormData.append("GroupId", "");
		bodyFormData.append("SubGroupId", "");
		bodyFormData.append("DrillId", "");
		bodyFormData.append("FromDate", "");
		bodyFormData.append("ToDate", "");
		bodyFormData.append("StatusId", "");
		bodyFormData.append("ManagerId", "");
		bodyFormData.append("MyVessels", "false");
		bodyFormData.append("MyNotification", "false");

		let options = {
			method: "POST",
			url: `${this.url}/pallpsq/LPSQ/Drill/GetDrillList`,
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.timeEnd("Drills POST request");
		return response.data.Data;
	}

	/**
	 * Get the pending list for Purchase docId
	 * @param {number} docId
	 * @return {Promise<Object[]>} Array of actions objects
	 */
	async getPendingList(docId) {
		console.time("Pending list request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("docId", docId);
		bodyFormData.append("pageType", "AQT_DEF"); // AQT_DEF or PO_ALL
		bodyFormData.append("docType", 1);
		bodyFormData.append("isShow", "true");

		let options = {
			method: "POST",
			url: `${this.url}/palpurchase/SharedPlugins/ApprovalList/GetApprovalList`,
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.timeEnd("Pending list request");
		return response.data.Data;
	}

	/**
	 * Returns the cumulated EU MRV voyages consumptions for the given vessel and, optionally, year.
	 * It will normally run from 1 Jan of current year until given date, unless the year is also specified
	 * @param {string} vesselName
	 * @param {Date} date - JavaScript Date object
	 * @param {boolean} runFromPrevYear - default false. set to true if to run from previous year
	 * @return {Promise<{vessel: string, startDate: string, endDate: string, legs: Object[]}>} Object with results
	 */
	async eumrv(vesselName, date, runFromPrevYear = false) {
		console.time("EU MRV");
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

	async getQDMSfolderDocsPerPage(folderId, page, pageSize) {
		// 6148 = Ports Information folder

		console.log(`Fetching QDMS documents in folder ID ${folderId} page ${page} of ${pageSize} records each`);

		// build the Form body
		let bodyFormData = new URLSearchParams();
		bodyFormData.append("sort", "");
		bodyFormData.append("page", page);
		bodyFormData.append("pageSize", pageSize);
		bodyFormData.append("group", "");
		bodyFormData.append("SelectedID", folderId);
		bodyFormData.append("Dateoption", "ALL");
		bodyFormData.append("FromDate", "01-Oct-2018");
		bodyFormData.append("Todate", "02-Nov-2025");
		bodyFormData.append("Allword", "");
		bodyFormData.append("phrase", "");
		bodyFormData.append("anyword", "");
		bodyFormData.append("noneWords", "");
		bodyFormData.append("Selectedfolder", "false");
		bodyFormData.append("VesselObjectID", "-1");
		bodyFormData.append("VesselTypeID", "-1");
		bodyFormData.append("Flag_ID", "-1");
		bodyFormData.append("ClassTypeID", "-1");
		bodyFormData.append("Applicable_To", "-1");
		bodyFormData.append("isMyVSl", "N");
		bodyFormData.append("companyList", "");
		bodyFormData.append("vesselList", "");
		bodyFormData.append("libraryID", "");

		const response = await fetch(`${this.url}/palqdms/QDMS/DocumentLibrary/DocumentList_Read`, {
			method: "POST",
			headers: { Cookie: `.BSMAuthCookie=${this.cookie}` },
			body: bodyFormData,
		});

		const body = await response.json();
		if (body.Errors) throw new Error(body.Errors);

		return body;
	}

	/**
	 * Get all the documents in a given QDMS folder, by its internal folder ID
	 * @param {number} folderId
	 * @return {Promise<QDMSdoc[]>} Array of QDMS documents objects
	 */
	async getQDMSdocsByFolderId(folderId) {
		let page = 1;
		const pageSize = 200;

		const response = await this.getQDMSfolderDocsPerPage(folderId, page, pageSize);
		const noOfRecords = response.Total;

		// get all the documents, on all pages, until all are received
		let allRecords = response.Data;
		while (noOfRecords > page * pageSize) {
			page++;
			const newPage = await this.getQDMSfolderDocsPerPage(folderId, page, pageSize);
			newPage.Data.forEach((r) => {
				allRecords.push(r);
			});
		}
		console.log(`Returned ${allRecords.length} documents`);
		return allRecords;

		// {
		// 	CreatedBy: "Marine Assistant";
		// 	CreatedOn: "31-Oct-2023 06:51:46";
		// 	DocFolder: "Karlshamn";
		// 	DocNo: "PI-KAR-02";
		// 	DocSite: "All";
		// 	Doctitle: "CDC - Sweden";
		// 	ID: 99990000505971;
		// 	Revision: 3;
		// }
	}
}

export * from "./utils.js";
