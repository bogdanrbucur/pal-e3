import axios from "axios";
import FormData from "form-data";

/**
 * Gets all the Purchase users in PAL
 * @return {Promise<Object[]>} Array of objects, each containing a user
 */
export default async function getUsers() {
	console.log("Start request for users...");
	console.time("Users request");

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
		url: `${this.url}/palpurchase/PurchasePAL/AllocationOfVessel/GetAllocationVesselUserDetails`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	// if the users are already cached, return the cached data
	if (this.cachedUsers) {
		console.log("Returned cached users");
		console.timeEnd("Users request");
		return this.cachedUsers;
	}

	let response = await axios.request(options);
	console.log("Got response for users");
	console.log(`${response.data.Total} users received`);
	console.timeEnd("Users request");

	// cache the users
	this.cachedUsers = response.data.Data;

	return response.data.Data;
}
