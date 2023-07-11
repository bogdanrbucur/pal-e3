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
		let vesslesIdsString = await this.vesselNamesToObjectIds(vessels);

		// convert the array of vessel names to string of IDs
		let catoriesIds = await this.categoriesNamesToIds(categories, docType);

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
	async vesselNamesToObjectIds(vesselsArray) {
		// make sure the input vessel(s) are all UpperCase
		if (typeof vesselsArray === "string") vesselsArray = vesselsArray.toUpperCase();
		else vesselsArray = vesselsArray.map((vsl) => vsl.toUpperCase());

		console.log(vesselsArray);

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
	 * Transforms an array of vessel names to a string of VesselIds to be used in other methods
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of VesselIds as string: "246049,246026"
	 */
	async vesselNamesToIds(vesselsArray) {
		// make sure the input vessel(s) are all UpperCase
		if (typeof vesselsArray === "string") vesselsArray = vesselsArray.toUpperCase();
		else vesselsArray = vesselsArray.map((vsl) => vsl.toUpperCase());

		let vessels = await this.getVessels();
		let filteredVessels = vessels.filter((vessel) => vesselsArray.includes(vessel.VesselName));
		let vesselsIds = "";
		filteredVessels.forEach((vsl) => {
			vesselsIds += vsl.VesselId += ",";
		});
		vesselsIds = vesselsIds.slice(0, -1);
		return vesselsIds;
	}

	/**
	 * Gets all the vessels in PAL
	 * @param
	 * @return {Promise<Array>} Array of objects, each containing a Purchase category
	 */
	async getPurchaseCategories(docType) {
		if (!["JOB", "PROC"].includes(docType)) throw new Error("Document type unknown! Must be JOB or PROC");
		console.log("Start POST request for Purchase categories...");
		console.time("Purchase categories POST request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("OpertionType", `${docType}`);
		bodyFormData.append("filter[logic]", "and");
		bodyFormData.append("filter[filters][0][field]", "Value");
		bodyFormData.append("filter[filters][0][operator]", "eq");
		bodyFormData.append("filter[filters][0][value]", `${docType}`);

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
	 * @param {string} docType "PROC" or "JOB"
	 * @return {Promise<string>} List of Ids as string: "201205,201184"
	 */
	async categoriesNamesToIds(categoriesArray, docType) {
		// Select Any is category 0
		if (typeof categoriesArray === "string" && categoriesArray.toUpperCase() === "SELECT ANY") return 0;

		// make sure the input categori(es) are all UpperCase
		if (typeof categoriesArray === "string") categoriesArray = categoriesArray.toUpperCase();
		else categoriesArray = categoriesArray.map((cat) => cat.toUpperCase());

		let categories = await this.getPurchaseCategories(docType);
		let filteredCategories = categories.filter((cat) => categoriesArray.includes(cat.Text.toUpperCase()));
		let categoriesString = "";
		filteredCategories.forEach((cat) => {
			categoriesString += cat.Value += ",";
		});
		categoriesString = categoriesString.slice(0, -1);

		if (categoriesString === "") throw new Error("Category not found!");
		return categoriesString;
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
	async purchaseAllocation(docType, vessel, category, role, users, template) {
		if (!["JOB", "PROC"].includes(docType)) throw new Error("Document type unknown! Must be JOB or PROC");
		if (docType === "JOB" && template == null) throw new Error("Approval template is mandatory for JOB document type!");

		console.log("Start POST request for PRC Allocation...");
		console.time("PRC allocation POST request");

		// convert the array of vessel names to string of IDs
		let vslObjectIds = await this.vesselNamesToObjectIds(vessel);
		console.log(`VesselObjectId: ${vslObjectIds}`);
		let vslIds = await this.vesselNamesToIds(vessel);
		console.log(`VesselId: ${vslIds}`);

		// get users by ID
		let usersIds = await this.userNamesToIds(users);
		console.log(`UsersIds: ${usersIds}`);

		// get category by ID
		let catId = await this.categoriesNamesToIds(category, docType);
		console.log(`CategoryId: ${catId}`);

		// Define ApprovalCycleTemplateId and ApprovalTemplateId depending on the document type
		let approvalsIds;
		let ApprovalCycleTemplateId;
		let ApprovalTemplateId;
		let VesselAllocationId;
		switch (docType) {
			case "PROC":
				// call getPRCtemplateIds without ApprovalCycleTemplateId, as it's only required for JOB document types
				approvalsIds = await this.getCurrentPRCallocation(docType, vslIds, vslObjectIds, catId);

				ApprovalTemplateId = approvalsIds.ApprovalTemplateId;
				ApprovalCycleTemplateId = approvalsIds.ApprovalCycleTemplateId;
				VesselAllocationId = approvalsIds.VesselAllocationId;
				break;
			case "JOB":
				ApprovalTemplateId = 0;

				// Get the Cycle Templates IDs if allocating to JOB document type
				let cycleTemplates = await this.getPRCcycleTemplateIds();

				// get ApprovalCycleTemplateId from the template name
				cycleTemplates.forEach((ct) => {
					if (ct.Name.toUpperCase() === template.toUpperCase()) {
						ApprovalCycleTemplateId = ct.Id;
					}
				});
				if (ApprovalCycleTemplateId === undefined) {
					throw new Error("Cycle template not found!");
				}

				// call getPRCtemplateIds with ApprovalCycleTemplateId, as it's required for JOB document types
				approvalsIds = await this.getCurrentPRCallocation(docType, vslIds, vslObjectIds, catId, ApprovalCycleTemplateId);

				VesselAllocationId = approvalsIds.VesselAllocationId;
				break;

			default:
				break;
		}

		// get roleCode
		let roleCode;
		approvalsIds.roles.forEach((responseRole) => {
			if (responseRole.Name.toUpperCase() === role.toUpperCase()) {
				roleCode = responseRole.Code;
			}
		});
		if (roleCode === undefined) {
			throw new Error("Role not found!");
		}

		// get roleCode
		let roleId;
		approvalsIds.roles.forEach((responseRole) => {
			if (responseRole.Name.toUpperCase() === role.toUpperCase()) {
				roleId = responseRole.Id;
			}
		});
		if (roleId === undefined) {
			throw new Error("Role not found!");
		}

		console.log(`ApprovalCycleTemplateId: ${ApprovalCycleTemplateId}`);
		console.log(`ApprovalTemplateId: ${ApprovalTemplateId}`);
		console.log(`VesselAllocationId: ${VesselAllocationId}`);
		console.log(`RoleCode: ${roleCode}`);
		console.log(`RoleId: ${roleId}`);

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("ApprovalCycleTemplateId", `${ApprovalCycleTemplateId}`);
		bodyFormData.append("ApprovalTemplateId", `${ApprovalTemplateId}`);
		bodyFormData.append("VesselId", "");
		bodyFormData.append("VesselObjectId", vslObjectIds);
		bodyFormData.append("CategoryId", catId);
		bodyFormData.append("DocType", `${docType}`);
		bodyFormData.append("models[0].Id", `${roleId}`);
		bodyFormData.append("models[0].Code", `${roleCode}`);
		bodyFormData.append("models[0].Name", "");
		bodyFormData.append("models[0].RoleLevel", 1);
		bodyFormData.append("models[0].Active", "true");
		bodyFormData.append("models[0].SortOrder", "");
		bodyFormData.append("models[0].ModifiedById", "");
		bodyFormData.append("models[0].ModifiedOn", "");
		bodyFormData.append("models[0].ModifiedBy", "");
		bodyFormData.append("models[0].NewModifiedOn", "");
		bodyFormData.append("models[0].UserIds", usersIds);
		bodyFormData.append("models[0].UserNames", "");
		bodyFormData.append("models[0].VesselAllocationId", `${VesselAllocationId}`);
		bodyFormData.append("models[0].VesselId", 0);
		bodyFormData.append("models[0].VesselObjectId", 0);
		bodyFormData.append("models[0].ApprovalCycleTemplateId", `${ApprovalCycleTemplateId}`);
		bodyFormData.append("models[0].ApprovalTemplateId", `${ApprovalTemplateId}`);
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

		// validate the action
		// if any error exists, return false
		if (response.data.Errors !== null) return false;
		// read the current allocation and check if it matches the input
		let isSuccesful = await this.isPRCallocSuccessful(docType, ApprovalCycleTemplateId, ApprovalTemplateId, roleCode, usersIds, VesselAllocationId, vslIds, vslObjectIds, catId);
		return isSuccesful;
	}

	/**
	 * Gets all the Purchase users in PAL
	 * @return {Promise<Object[]>} Array of objects, each containing a user
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
	 * Transforms an array/string of usernames to a string of Ids to be used in other allocation methods
	 * @param {Array<string>} userNames String or array of users names: ["Bogdan", "Helen"]
	 * @return {Promise<string>} String of user IDs: "1126,1114"
	 */
	async userNamesToIds(userNames) {
		if (userNames === "") return "";

		let users = await this.getPRCusers();

		// if input is string, make an array of one item and continue
		if (typeof userNames == "string") {
			userNames = [`${userNames}`];
		}

		let filteredUsers = [];
		users.forEach((user) => {
			const isMatch = userNames.some((word) => user.Name.toUpperCase().includes(word.toUpperCase()));
			if (isMatch) filteredUsers.push(user);
		});

		let userIds = "";
		filteredUsers.forEach((usr) => {
			userIds += usr.UserId += ",";
		});
		userIds = userIds.slice(0, -1);
		if (userIds === "") throw new Error("User not found!");
		return userIds;
	}

	/**
	 * Get the current Purchase allocation
	 * @param {string} docType "PROC" or "JOB"
	 * @param {number} vesselId VesselId
	 * @param {number} vesselObjectId VesselObjectId
	 * @param {number} categoryId CategoryId
	 * @return {Promise<Object{ApprovalCycleTemplateId, ApprovalTemplateId, VesselAllocationId, roles[]}>}
	 */
	async getCurrentPRCallocation(docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId = "") {
		if (!["JOB", "PROC"].includes(docType)) throw new Error("Document type unknown! Must be JOB or PROC");

		console.log("Start request for current PRC allocation...");
		console.time("Current PRC allocation request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "");
		bodyFormData.append("VesselId", vesselId);
		bodyFormData.append("VesselObjectId", vesselObjectId);
		bodyFormData.append("CategoryId", categoryId);
		bodyFormData.append("DocType", `${docType}`);
		bodyFormData.append("CycleTemplateId", ApprovalCycleTemplateId);

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/AllocationOfVessel/GetFunctionalRoleDetails",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got response for current PRC allocation");
		console.timeEnd("Current PRC allocation request");
		// return response.data.Data[0];
		return {
			ApprovalCycleTemplateId: response.data.Data[0].ApprovalCycleTemplateId,
			ApprovalTemplateId: response.data.Data[0].ApprovalTemplateId,
			VesselAllocationId: response.data.Data[0].VesselAllocationId,
			roles: response.data.Data,
		};
	}

	/**
	 * Validate the reponse to check if the PRC allocation was succesful
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
	async isPRCallocSuccessful(docType, ApprovalCycleTemplateId, ApprovalTemplateId, RoleId, UserIds, VesselAllocationId, vesselId, vesselObjectId, categoryId) {
		let valid = false;
		let response = await this.getCurrentPRCallocation(docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId);

		// make an array from the provided user IDs
		let UserIdsArray = UserIds.split(",");

		response.roles.forEach((element) => {
			// make an array from the server reponse users
			let responseUserIdsArray = element.UserIds.split(",");
			let usersValid = false;

			// for each provided user ID, check if it's among the ones the server responded with
			UserIdsArray.forEach((user) => {
				if (responseUserIdsArray.includes(user)) {
					usersValid = true;
				} else {
					usersValid = false;
				}
			});

			if (
				element.ApprovalCycleTemplateId === ApprovalCycleTemplateId &&
				element.ApprovalTemplateId === ApprovalTemplateId &&
				element.Code === RoleId &&
				element.VesselAllocationId === VesselAllocationId &&
				usersValid
			) {
				valid = true;
			}
		});
		return valid;
	}

	/**
	 * Get the IDs of all the cycle templates
	 * @return {Promise<Object[]>}
	 */
	async getPRCcycleTemplateIds() {
		console.log("Start request for PRC cycle template IDs...");
		console.time("Purchase cycle template IDs request");

		// build the Form body
		let bodyFormData = new FormData();
		bodyFormData.append("sort", "");
		bodyFormData.append("page", 1);
		bodyFormData.append("pageSize", 200);
		bodyFormData.append("group", "");
		bodyFormData.append("filter", "Name~contains~''");

		let options = {
			method: "POST",
			url: "https://palapp.asm-maritime.com/palpurchase/PurchasePAL/ProcurementBusinessFlow/GetTemplateDetails",
			headers: {
				Accept: "*/*",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
				Cookie: `.BSMAuthCookie=${this.cookie}`,
			},
			data: bodyFormData,
		};

		let response = await axios.request(options);
		console.log("Got response for PRC cycle template IDs");
		console.timeEnd("Purchase cycle template IDs request");
		// return response.data.Data[0];
		return response.data.Data;
	}
}

export * from "./parse.js";
