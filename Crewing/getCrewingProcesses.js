import axios from "axios";
import FormData from "form-data";

/**
 * Get all the Crewing processes and their IDs
 * @private
 * @return {Promise<Object[]>} Array of Voyage alert role objects
 */
export default async function getCrewingProcesses() {
	console.log("Start request for Crewing processes...");
	console.time("Crewing processes request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("page", 1);
	bodyFormData.append("pageSize", 50);
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");

	let options = {
		method: "POST",
		url: `${this.url}/palmdm/CrewingPAL/ProcessMaster/GetProcessMasterData`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for Crewing processes");
	console.timeEnd("Crewing processes request");

	if (response.data.Data) {
		return response.data.Data;
	} else {
		throw new Error("Failed to retrieve Crewing processes!");
	}
}
