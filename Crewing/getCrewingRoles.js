import axios from "axios";
import FormData from "form-data";

/**
 * Gets all the roles in Crewing
 * @return {Promise<{Id: number,Code: string,Name: string,RoleLevel: number,Active: boolean,Is_Active: boolean}[]>} Array of objects, each containing a role
 */
export default async function getCrewingRoles() {
	console.log("Start request for Crewing roles...");
	console.time("Crewing roles request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("page", 1);
	bodyFormData.append("pageSize", 100);
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");

	let options = {
		method: "POST",
		url: `${this.url}/palmdm/CrewingPAL/FunctionalRoles/GetFunctionalRolesData`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for Crewing roles");
	console.timeEnd("Crewing roles request");

	if (response.data.Data) {
		return response.data.Data;
	} else {
		throw new Error("Failed to retrieve Crewing roles!");
	}
}
