import axios from "axios";
import FormData from "form-data";

/**
 * Get the Crewing roles for the given vessel and Crewing process
 * @private
 * @param {number} VesselId
 * @param {number} VesselObjectId
 * @param {number} processId
 * @return {Promise<Object[]>} Array of Voyage alert role objects
 */
export default async function getAllocatedUsers(VesselId, VesselObjectId, processId) {
	console.log("Start request for allocated Crewing users...");
	console.time("Allocated Crewing users request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("ProcessId", processId);
	bodyFormData.append("VesselId", VesselId);
	bodyFormData.append("VesselObjectId", VesselObjectId);
	bodyFormData.append("companyId", 1);

	let options = {
		method: "POST",
		url: `${this.url}/palmdm/CrewingPAL/AllocationOfVessel/GetFunctionalRoleDetails`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for allocated Crewing users");
	console.timeEnd("Allocated Crewing users request");

	if (response.data.Data) {
		return response.data.Data;
	} else {
		throw new Error("Failed to retrieve allocated Crewing users!");
	}
}
