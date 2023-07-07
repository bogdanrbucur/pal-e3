import puppeteer from "puppeteer";
import axios from "axios";
import FormData from "form-data";

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

			if (cookie.length === 192) {
				console.log(`Got .BSMAuthCookie`);

				await browser.close();
				console.log(`Closed the browser`);

				this.cookie = cookie;
				resolve(cookie);
			} else {
				console.error("Received invalid cookie! Check the login credentials");
				throw new Error("Received invalid cookie! Check the login credentials");
			}
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
	 * @param {Array} vessels Array of vessel names: ["CHEM MIA", "CHEM ZEALOT"]
	 * @param {number} year
	 * @param {number} docType Requisition: 1, PO: 4
	 * @param {Array} categories Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @return {Promise<Array>} Array of objects, each containing a Purchase document
	 */
	async generalQuery(vessels, year, docType, categories) {
		console.log("Start General Query POST request...");
		console.time("General Query reponse time");

		// convert the array of vessel names to string of IDs
		let vesslesIdsString = await this.vesselNamesToIds(vessels);

		// convert the array of vessel names to string of IDs
		let catoriesIds = await this.categoriesNamesToIds(categories);

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
		body.append("NewVesselObjectId", vesslesIdsString);
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
      CategoriesMultiList: "${catoriesIds}",
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
		console.log(`${response.data.Total} PRC documents received`);
		console.timeEnd("General Query reponse time");

		return response.data.Data;
	}

	/**
	 * Gets all the PSC reports available in PAL
	 * @return {Promise<Array>} Array of objects, each containing an inspection report
	 */
	async getPSCreports() {
		console.log("Start POST request for vessels' schedule...");
		console.time("PSC reports POST request");

		let startDate = new Date("2000-01-01");
		let untilDate = new Date();

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("pages", 1);
		bodyFormData.append("pageSize", 10000);
		bodyFormData.append("TreeLevel", 2);
		bodyFormData.append("OffVslOptSelect", "VSL");
		bodyFormData.append("DateYearOptSelect", "DATE");
		bodyFormData.append("FromDate", dateToString(startDate));
		bodyFormData.append("Todate", dateToString(untilDate));
		bodyFormData.append("ReportViewType", "PSC");
		bodyFormData.append("IsPendApproval", "N");
		bodyFormData.append("ReportTypeId", -1001);

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/pallpsq/LPSQ/ComplianceOverview/GetReportList",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got POST response for PSC reports");
		console.log(`${response.data.Total} PSC inspections received`);
		console.timeEnd("PSC reports POST request");
		return response.data.Data;
	}

	/**
	 * Gets all the vessels in PAL
	 * @return {Promise<Array>} Array of objects, each containing a vessel
	 */
	async getVessels() {
		console.log("Start POST request for vessels...");
		console.time("Vessels POST request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("HideGridContent", "false");
		bodyFormData.append("companyId", 1);

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/AllocationOfVessel/GetAllocationVesselDetails",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got POST response for vessels");
		console.timeEnd("Vessels POST request");
		return response.data.Data;
	}

	/**
	 * Transforms an array of vessel names to a string of VesselObjectIds to be used in other methods
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of VesselObjectIds as string: "246049,246026"
	 */
	async vesselNamesToIds(vesselsArray) {
		let vessels = await this.getVessels();
		let filteredVessels = vessels.filter((vessel) => vesselsArray.includes(vessel.VesselName));
		let vesselsIds = "";
		filteredVessels.forEach((vsl) => {
			vesselsIds += vsl.VesselObjectId += ",";
		});
		vesselsIds = vesselsIds.slice(0, -1);
		return vesselsIds;
	}

	/**
	 * Gets all the vessels in PAL
	 * @return {Promise<Array>} Array of objects, each containing a Purchase category
	 */
	async getPurchaseCategories() {
		console.log("Start POST request for Purchase categories...");
		console.time("Purchase categories POST request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("OpertionType", "PROC");
		bodyFormData.append("filter[logic]", "and");
		bodyFormData.append("filter[filters][0][field]", "Value");
		bodyFormData.append("filter[filters][0][operator]", "eq");
		bodyFormData.append("filter[filters][0][value]", "PROC");

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/AllocationOfVessel/GetJobOrderCategory",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got POST response for Purchase categories");
		console.timeEnd("Purchase categories POST request");
		return response.data;
	}

	/**
	 * Transforms an array of Purchase categories names to a string of IDs to be used in other methods
	 * @param {array} myVessels Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @return {Promise<string>} List of Ids as string: "201205,201184"
	 */
	async categoriesNamesToIds(categoriesArray) {
		let categories = await this.getPurchaseCategories();
		let filteredCategories = categories.filter((cat) => categoriesArray.includes(cat.Text));
		let categoriesString = "";
		filteredCategories.forEach((cat) => {
			categoriesString += cat.Value += ",";
		});
		categoriesString = categoriesString.slice(0, -1);
		return categoriesString;
	}

	/**
	 * Gets all the vessels in PAL
	 * @param {string} vessel String with vessel name
	 * @return {Promise<Array>} Array of objects, each containing a vessel
	 */
	async prcAllocProcurement(vessel) {
		console.log("Start POST request for PRC Allocation...");
		console.time("PRC allocation POST request");

		// convert the array of vessel names to string of IDs
		// TODO calling the same endpoint twice? cah...
		let vslObjectIds = await this.vesselNamesToIds(vessel);
		let vslAllocIds = await this.vesselNamesToAllocIds(vessel);

		// TODO get users by ID
		// TODO

		// TODO get roles by ID
		// TODO

		// TODO get ApprovalTemplateID
		// TODO

		// TODO get ApprovalCycleTemplateId
		// TODO

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("ApprovalCycleTemplateId", 201177); // TODO method to replace name with number
		bodyFormData.append("ApprovalTemplateId", 201178); // TODO method to replace name with number
		bodyFormData.append("VesselId", "");
		bodyFormData.append("VesselObjectId", vslObjectIds);
		bodyFormData.append("CategoryId", 0);
		bodyFormData.append("DocType", "PROC");
		bodyFormData.append("models[0].Id", 23); // TODO get role ID by name
		bodyFormData.append("models[0].Code", 23); // TODO get role ID by name
		bodyFormData.append("models[0].Name", "");
		bodyFormData.append("models[0].RoleLevel", 1);
		bodyFormData.append("models[0].Active", "true");
		bodyFormData.append("models[0].SortOrder", "");
		bodyFormData.append("models[0].ModifiedById", "");
		bodyFormData.append("models[0].ModifiedOn", "");
		bodyFormData.append("models[0].ModifiedBy", "");
		bodyFormData.append("models[0].NewModifiedOn", "");
		bodyFormData.append("models[0].UserIds", "145595"); // TODO method to replace names with numbers
		bodyFormData.append("models[0].UserNames", "");
		bodyFormData.append("models[0].VesselAllocationId", vslAllocIds);
		bodyFormData.append("models[0].VesselId", 0);
		bodyFormData.append("models[0].VesselObjectId", 0);
		bodyFormData.append("models[0].ApprovalCycleTemplateId", 201177); // TODO method to replace name with number
		bodyFormData.append("models[0].ApprovalTemplateId", 201178); // TODO method to replace name with number
		bodyFormData.append("models[0].StopProcess", "");
		bodyFormData.append("models[0].SNo", "");

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/AllocationOfVessel/UpdateFunctionalRoles",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got POST response for Vessels IDs");
		console.timeEnd("PRC allocation POST request");
		return response.data;
	}

	/**
	 * Transforms an array of vessel names to a string of Allocation Ids to be used in vessel allocation methods
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of Allocation IDs as string: "1126,1114"
	 */
	async vesselNamesToAllocIds(vesselsArray) {
		let vessels = await this.getVessels();
		let filteredVessels = vessels.filter((vessel) => vesselsArray.includes(vessel.VesselName));
		let vesselsIds = "";
		filteredVessels.forEach((vsl) => {
			vesselsIds += vsl.Id += ",";
		});
		vesselsIds = vesselsIds.slice(0, -1);
		return vesselsIds;
	}

	/**
	 * Gets all the Purchase users in PAL
	 * @return {Promise<Array>} Array of objects, each containing a user
	 */
	async getPRCusers() {
		console.log("Start POST request for Purchase users...");
		console.time("Purchase users request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("page", 1);
		bodyFormData.append("pageSize", 500);
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("companyId", 1);
		bodyFormData.append("FunctionalRoleId", "1");
		bodyFormData.append("UserIds", "");
		bodyFormData.append("UserName", "");
		bodyFormData.append("VesselId", "");
		bodyFormData.append("VesselObjectId", "");
		bodyFormData.append("HideGridContent", "false");
		bodyFormData.append("CategoryId", "");
		bodyFormData.append("DocType", "");
		bodyFormData.append("CycleTemplateId", "");

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/AllocationOfVessel/GetAllocationVesselUserDetails",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got POST response for Purchase users");
		console.log(`${response.data.Total} users received`);
		console.timeEnd("Purchase users request");
		return response.data.Data;
	}

	/**
	 * Transforms an array of usernames to a string of Ids to be used in other allocation methods
	 * @param {Array<string>} userNames String or array of users names: ["Bogdan", "Yaniv"]
	 * @return {Promise<string>} String of user IDs: "1126,1114"
	 */
	async userNamesToIds(userNames) {
		let users = await this.getPRCusers();

		// if input is string, make an array of one item and continue
		if (typeof userNames == "string") {
			userNames = [`${userNames}`];
		}

		let filteredUsers = [];
		users.forEach((user) => {
			const isMatch = userNames.some((word) => user.Name.toLowerCase().includes(word.toLowerCase()));
			if (isMatch) filteredUsers.push(user);
		});

		let userIds = "";
		filteredUsers.forEach((usr) => {
			userIds += usr.UserId += ",";
		});
		userIds = userIds.slice(0, -1);
		return userIds;
	}
}

export * from "./parse.js";
