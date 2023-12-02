import axios from "axios";
import FormData from "form-data";

/**
 * Add user to MDM Crewing Vessel User Allocation
 * @private
 * @param {number} roleId
 * @param {number} userIds
 * @param {string} userName
 * @param {number} vslId
 * @param {number} vslObjectId
 * @param {number} processId
 * @return {Promise<boolean>} success or not
 */
export default async function addCrewAllocation(roleId, userIds, userName, vslId, vslObjectId, processId) {
	console.log("Start request for adding crew allocation...");
	console.time("Adding crew allocation request");

	// build the Form body
	let bodyFormData = new FormData();
	bodyFormData.append("sort", "");
	bodyFormData.append("group", "");
	bodyFormData.append("filter", "");
	bodyFormData.append("models[0].Id", roleId);
	bodyFormData.append("models[0].FId", 0);
	bodyFormData.append("models[0].Code", "");
	bodyFormData.append("models[0].Name", "");
	bodyFormData.append("models[0].RoleLevel", 0);
	bodyFormData.append("models[0].Active", "true");
	bodyFormData.append("models[0].SortOrder", 0);
	bodyFormData.append("models[0].ModifiedById", 0);
	bodyFormData.append("models[0].VesselAllocationDetailId", 0);
	bodyFormData.append("models[0].HDCompanyId", 0);
	bodyFormData.append("models[0].LoggedUserCompanyId", 0);
	bodyFormData.append("models[0].UserIds", userIds);
	bodyFormData.append("models[0].UserNames", userName);
	bodyFormData.append("models[0].BackUpUserNames", "");
	bodyFormData.append("models[0].Email", "");
	bodyFormData.append("models[0].BackUpEmail", "");
	bodyFormData.append("models[0].VesselAllocationId", 0);
	bodyFormData.append("models[0].VesselId", 0);
	bodyFormData.append("models[0].VesselObjectId", 0);
	bodyFormData.append("models[0].ApprovalCycleTemplateId", 0);
	bodyFormData.append("models[0].ApprovalTemplateId", 0);
	bodyFormData.append("models[0].SNo", 0);
	bodyFormData.append("ApprovalCycleTemplateId", 0);
	bodyFormData.append("ApprovalTemplateId", 0);
	bodyFormData.append("VesselId", vslId);
	bodyFormData.append("VesselObjectId", vslObjectId);
	bodyFormData.append("CompanyId", 1);
	bodyFormData.append("ProcessId", processId);

	let options = {
		method: "POST",
		url: `${this.url}/palmdm/CrewingPAL/AllocationOfVessel/UpdateFunctionalRoles`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got response for adding crew allocation");
	console.timeEnd("Adding crew allocation request");

	if (response.data.Errors) throw new Error("Crewing process user allocation failed!");
	if (response.data === "") {
		return true;
	} else {
		return false;
	}
}
