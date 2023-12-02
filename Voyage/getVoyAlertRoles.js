import axios from "axios";
import FormData from "form-data";

/**
 * Get all the Voyage alert roles
 * @private
 * @param {number} vslId
 * @param {number} vslObjectId
 * @return {Promise<{VessleId:number,VessleObjectId:number,AlertRoleName:string,AlertRoleId:number,UserIds:string,UserNames:string}[]>} Array of Voyage alert role objects
 */
export default async function getVoyAlertRoles(vslId, vslObjectId) {
	console.log("Start request for Voyage alert roles...");
	console.time("Voyage alert roles request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("VesselId", vslId);
	bodyFormData.append("VesselObjectId", vslObjectId);
	bodyFormData.append("CategoryId", "");

	let options = {
		method: "POST",
		url: `${this.url}/palvoyage/VoyagePAL/AllocateRoles/GetAllocateRoles`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for Voyage alert roles");
	console.timeEnd("Voyage alert roles request");

	if (response.data.Data) {
		return response.data.Data;
	} else {
		throw new Error("Failed to retrieve Voyage User Alert Configuration roles!");
	}
}
