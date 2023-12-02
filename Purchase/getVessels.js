import axios from "axios";
import FormData from "form-data";

/**
 * Gets all the vessels in PAL
 * @return {Promise<Array>} Array of objects, each containing a vessel
 */
export default async function getVessels() {
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
		url: `${this.url}/palpurchase/PurchasePAL/AllocationOfVessel/GetAllocationVesselDetails`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	if (this.cachedVessels) {
		console.log("Returned cached vessels");
		console.timeEnd("Vessels POST request");
		return this.cachedVessels;
	}

	let response = await axios.request(options);
	console.log("Got POST response for vessels");
	console.timeEnd("Vessels POST request");

	// cache the vessels
	this.cachedVessels = response.data.Data;

	return response.data.Data;
}
