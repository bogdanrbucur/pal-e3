/**
	 * Validate the reponse to check if the PRC allocation was succesful
	 * @private
	 * @param {string} docType
	 * @param {number} ApprovalCycleTemplateId
	 * @param {number} ApprovalTemplateId
	 * @param {number} RoleId
	 * @param {string} UserIds
	 * @param {number} VesselAllocationId
	 * @param {number} vesselId
	 * @param {number} vesselObjectId
	 * @param {string} categoryId
	 * @return {Promise<boolean>}
	 */
export default async function isPRCallocSuccessful(docType, ApprovalCycleTemplateId, ApprovalTemplateId, RoleId, UserIds, VesselAllocationId, vesselId, vesselObjectId, categoryId) {
  let valid = false;
  let response = await this.getCurrentPRCallocation(docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId);

  // make an array from the provided user IDs
  let UserIdsArray = UserIds.split(",");

  response.roles.forEach((element) => {
    // make an array from the server reponse users
    let responseUserIdsArray = element.UserIds.split(",");
    let usersValid = false;

    // for each provided user ID, check if it's among the ones the server responded with
    UserIdsArray.forEach((user) => {
      if (responseUserIdsArray.includes(user)) {
        usersValid = true;
      } else {
        usersValid = false;
      }
    });

    if (
      element.ApprovalCycleTemplateId === ApprovalCycleTemplateId &&
      element.ApprovalTemplateId === ApprovalTemplateId &&
      element.Code === RoleId &&
      element.VesselAllocationId === VesselAllocationId &&
      usersValid
    ) {
      valid = true;
    }
  });
  return valid;
}