import axios from "axios";
import FormData from "form-data";

/**
 * Remove MDM Crewing user from given fid
 * @private
 * @param {number} fid
 * @return {Promise<boolean>} success or not
 */
export default async function removeCrewingAllocation(fid) {
	console.log("Start request for removing Crewing allocation...");
	console.time("Removing Crewing allocation request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("checkedlist", fid);

	let options = {
		method: "POST",
		url: `${this.url}/palmdm/CrewingPAL/AllocationOfVessel/DeleteVesselAllocationList`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for removing Crewing allocation");
	console.timeEnd("Removing Crewing allocation request");

	if (response.data.success) {
		return response.data.success;
	} else {
		throw new Error("Failed to remove Crewing allocation!");
	}
}
