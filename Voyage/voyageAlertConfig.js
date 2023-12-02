import axios from "axios";
import FormData from "form-data";

/**
 * Replace current Voyage User Alert Configuration
 * @param {string} vessel
 * @param {string} role
 * @param {string | string[]} users
 * @return {Promise<boolean>} success or not
 */
export default async function voyageAlertConfig(vessel, role, users) {
	console.log(`Start Voyage Alert Config for ${vessel} ${role} ${users}`);

	// TODO calling the same API twice? ew...
	let vslId = await this.vesselNamesToIds(vessel);
	let vslObjectId = await this.vesselNamesToObjectIds(vessel);
	let usersResponse = await this.usersToIdAndUserName(users);
	let userIds = usersResponse.id;
	if (!userIds) userIds = "";
	let rolesResponse = await this.getVoyAlertRoles(vslId, vslObjectId);

	// get roleCode
	let roleId;

	rolesResponse.forEach((responseRole) => {
		if (responseRole.AlertRoleName.toUpperCase() === role.toUpperCase()) {
			roleId = responseRole.AlertRoleId;
		}
	});
	if (roleId === undefined) {
		throw new Error("Role not found!");
	}

	// Check if the exact same allocation is already done
	rolesResponse.forEach((r) => {
		if (userIds && r.UserIds === userIds && r.AlertRoleName.toUpperCase() === role.toUpperCase()) {
			console.log("Allocation already done. Skipping...");
			return true;
		}
	});

	// !debug
	// console.log("vslId", vslId);
	// console.log("vslObjectId", vslObjectId);
	// console.log("roleId", roleId);
	// console.log("userIds", userIds);

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("VesselId", vslId);
	bodyFormData.append("VesselObjectId", vslObjectId);
	bodyFormData.append("models[0].VessleId", 0);
	bodyFormData.append("models[0].VessleObjectId", 0);
	bodyFormData.append("models[0].AlertRoleName", "");
	bodyFormData.append("models[0].AlertRoleId", roleId);
	bodyFormData.append("models[0].UserIds", userIds);
	bodyFormData.append("models[0].UserNames", "");
	bodyFormData.append("models[0].SelectedUserIds", "");
	bodyFormData.append("models[0].RemovedUserIds", "");

	let options = {
		method: "POST",
		url: `${this.url}/palvoyage/VoyagePAL/AllocateRoles/InsertAllocateRoles`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for Voyage Alert Config");

	if (response.data.isSuccess) {
		return response.data.isSuccess;
	} else {
		console.log(response.data);
		throw new Error("Voyage User Alert Configuration allocation failed!");
	}
}
