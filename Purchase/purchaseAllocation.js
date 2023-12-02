import axios from "axios";
import FormData from "form-data";

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
export default async function purchaseAllocation(docType, vessel, category, role, users, template) {
	if (!["JOB", "PROC"].includes(docType)) throw new Error("Document type unknown! Must be JOB or PROC");
	if (docType === "JOB" && template == null) throw new Error("Approval template is mandatory for JOB document type!");

	console.log(`Start request for PRC Allocation: ${vessel} ${docType}-${category}: ${role}: ${users}`);
	console.time("PRC allocation");

	// convert the array of vessel names to string of IDs
	let vslObjectIds = await this.vesselNamesToObjectIds(vessel);
	// console.log(`VesselObjectId: ${vslObjectIds}`);
	let vslIds = await this.vesselNamesToIds(vessel);
	// console.log(`VesselId: ${vslIds}`);

	// get users by ID
	let usersIds;
	// if users = [""]
	if (users[0] === "" || users.length === 0) {
		usersIds = "";
	} else {
		let usersResponse = await this.usersToIdAndUserName(users);
		try {
			usersIds = usersResponse.id;
		} catch (err) {
			console.error(err);
			// this will not throw, but allocation won't happen
			usersIds = "99999999999";
			// process.exit(1);
		}
		if (!usersIds) usersIds = "";
	}
	// console.log(`UsersIds: ${usersIds}`);

	// get category by ID
	let catId = await this.categoriesNamesToIds(category, docType);
	// console.log(`CategoryId: ${catId}`);

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

			if (ApprovalTemplateId === 0 && ApprovalCycleTemplateId === 0 && VesselAllocationId === 0) return false;
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

	// get roleId
	let roleId;
	approvalsIds.roles.forEach((responseRole) => {
		if (responseRole.Name.toUpperCase() === role.toUpperCase()) {
			roleId = responseRole.Id;
		}
	});
	if (roleId === undefined) {
		throw new Error("Role not found!");
	}

	// console.log(`ApprovalCycleTemplateId: ${ApprovalCycleTemplateId}`);
	// console.log(`ApprovalTemplateId: ${ApprovalTemplateId}`);
	// console.log(`CategoryId: ${catId}`);
	// console.log(`RoleCode: ${roleCode}`);
	// console.log(`RoleId: ${roleId}`);
	// console.log(`UsersIds: ${usersIds}`);
	// console.log(`VesselAllocationId: ${VesselAllocationId}`);

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
		url: `${this.url}/palpurchase/PurchasePAL/AllocationOfVessel/UpdateFunctionalRoles`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
		},
		data: bodyFormData,
	};

	let response = await axios.request(options);
	console.log("Got POST response for Vessels IDs");
	console.timeEnd("PRC allocation");

	// validate the action
	// if any error exists, return false
	if (response.data.Errors !== null) return false;
	// read the current allocation and check if it matches the input
	let isSuccesful = await this.isPRCallocSuccessful(
		docType,
		ApprovalCycleTemplateId,
		ApprovalTemplateId,
		roleCode,
		usersIds,
		VesselAllocationId,
		vslIds,
		vslObjectIds,
		catId
	);
	return isSuccesful;
}
