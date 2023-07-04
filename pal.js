import puppeteer from "puppeteer";
import axios from "axios";
import { dateToString } from "./parse.js";
import FormData from "form-data";

/**
 * The class that contains all the PAL e3 methods
 * @class
 */
export default class PAL {
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
	 * Logs in to PAL using provided credentials, retrieves the session cookie and sets the cookie property
	 * @return {Promise<string>} The string representing .BSMAuthCookie
	 */
	async getCookie() {
		return new Promise(async (resolve, error) => {
			const browser = await puppeteer.launch({ headless: "new" }); // for running in Node.js
			// const browser = await puppeteer.launch({ executablePath: "./chromium/chrome.exe", headless: "new" }); // for .exe packages
			const page = await browser.newPage();
			const navigationPromise = page.waitForNavigation();

			// Go to login page
			await page.goto(`${this.url}/palweblogin/Home/Login`);
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

			// Get the page cookies and then the first one of them
			const pageCookies = await page.cookies();
			const cookie = pageCookies[0].value;
			console.log(`Got .BSMAuthCookie`);

			await browser.close();
			console.log(`Closed the browser`);

			this.cookie = cookie;
			resolve(cookie);
		}).catch((error) => {
			console.log(error);
		});
	}

	/**
	 * Gets all the vessels' port call schedule for the next month
	 * @return {Promise<Array>} Array of objects, each containing a port call
	 */
	async getVesselSchedule() {
		console.log("Start POST request for vessels' schedule...");
		console.time("Vessels' schedule POST request");
		// get today's date and 1 month from now
		let startDate = new Date();
		let untilDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palvoyage/VoyagePAL/PortCallPlanner/GetLegPlanning",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				"Content-Type": "application/json",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: { Fromdate: dateToString(startDate), ToDate: dateToString(untilDate) },
		};

		let response = await axios.request(options);
		console.log("Got POST request for vessels' schedule");
		console.timeEnd("Vessels' schedule POST request");
		return response.data.data;
	}

  	/**
	 * Gets PAL Purchase documents from General Query 
   * @param {string} categories List of PRC categories in format 9380,9383,9384 etc
   * @param {number} docType Requisition: 1, PO: 4
   * @param {string} vessels List of Vessel IDs in format 246049,246026,etc.
   * @param {number} year 
	 * @return {Promise<Array>} Array of objects, each containing a Purchase document
	 */
  async generalQuery (vessels, year, docType, categories) {
    console.log("Start General Query POST request...");
    console.time("General Query reponse time");
  
    // build the Form body
    let body = new FormData();
    body.append("sort", "");
    body.append("group", "");
    body.append("filter", "");
    body.append("ObjectId", "");
    body.append("whereClause", "");
    body.append("CycleCompletewhereclause", "");
    body.append("vesselId", "");
    body.append("vesselCompanyId", "");
    body.append("vesselOwnerId", "");
    body.append("fleetId", "");
    body.append("vesselGroupId", "");
    body.append("page", 1);
    body.append("pageSize", 50000);
    body.append("flag", "true");
    body.append("FLAG_PCC", "false");
    body.append("QueryType", 0);
    body.append("isAllVessels", "true");
    body.append("CrewManaged", "true");
    body.append("DateFilter", 6);
    body.append("NewVesselObjectId", vessels);
    body.append("selectedYear", year);
    body.append(
      "WhereConditions",
      `{
      whereclause: "",
      queryType: 0,
      CycleCompletewhereclause: "",
      FLAG_PCC: false,
      condition1: "Select Any",
      docType: "${docType}",
      SearchCondition1: "Select Any",
      Search1Date: "01-Jan-${year}",
      Search1Dates: "01-Jan-${year}",
      documentPaymentMultiList1: "",
      StatusFilter1: "",
      obj: "4",
      ItemIds1: "",
      AccountIds1: "",
      VesselObjectId_Conv: null,
      combEntity1: "",
      EntityId1: "",
      txtSearch1: "",
      getFilters_txtSearch1: null,
      Condition2: "Select Any",
      SearchCondition2: "Select Any",
      Search2Date: "01-Jan-${year}",
      Search2Dates: "01-Jan-${year}",
      Filter1: "0",
      StatusFilter2: "",
      documentPoMultiList2: "",
      documentInvoiceMultiList2: "",
      documentPaymentMultiList2: "",
      Filter2: "0",
      ItemIds2: "",
      combEntity2: "",
      EntityId2: "",
      AccountIds2: "",
      txtSearch2: "",
      getFilters_txtSearch2: null,
      documentPoMultiList1: "",
      documentInvoiceMultiList1: "",
      Condition3: "Select Any",
      SearchCondition3: "Select Any",
      Search3Date: "01-Jan-${year}",
      Search3Dates: "01-Jan-${year}",
      StatusFilter3: "",
      documentPoMultiList3: "",
      documentInvoiceMultiList3: "",
      documentPaymentMultiList3: "",
      ItemIds3: "",
      combEntity3: "",
      EntityId3: "",
      AccountIds3: "",
      txtSearch3: "",
      getFilters_txtSearch3: null,
      cashPO1: false,
      cashPO2: false,
      GeneralVendorId: "",
      PortId: "",
      CategoriesMultiList: "${categories}",
      DocumentIn: "0",
    }`
    );
  
    let options = {
      method: "POST",
      url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/GeneralQuery/GetGeneralQueryData",
      headers: {
        Accept: "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
        Cookie: `.BSMAuthCookie=${this.cookie}`,
      },
      data: body,
    };
  
    let response = await axios.request(options);
    console.log("Got POST response for General Query");
    console.log(`${response.Total} records displayed`);
    console.timeEnd("General Query reponse time");
  
    return response.data;
  };
}
