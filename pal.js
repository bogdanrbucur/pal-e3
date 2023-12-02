import { getCookie, usersToIdAndUserName, vesselNamesToIds, vesselNamesToObjectIds } from "./Common/index.js";
import {
	addCrewAllocation,
	crewAllocation,
	getAllocatedUsers,
	getCrewingProcesses,
	getCrewingRoles,
	getPlannedCrewChanges,
	getSeafarerContacts,
	removeCrewingAllocation,
} from "./Crewing/index.js";
import {
	categoriesNamesToIds,
	generalQuery,
	getCurrentPRCallocation,
	getPRCcycleTemplateIds,
	getPendingList,
	getPurchaseCategories,
	getUsers,
	getVessels,
	isPRCallocSuccessful,
	purchaseAllocation,
} from "./Purchase/index.js";
import { getQDMSdocsByFolderId, getQDMSfolderDocsPerPage } from "./QDMS/index.js";
import { getDrills, getPSCreports } from "./QHSE/index.js";
import { eumrv, getVesselSchedule, getVoyAlertRoles, imoDcs, voyageAlertConfig } from "./Voyage/index.js";

/**
 * Class with all PAL e3 API call methods
 */
export default class PALAPI {
	/**
	 * ERP URL without the trailing comma
	 * Example: https://palapp.apn-narisine.com
	 * @type {string}
	 */
	url;
	/**
	 * The ERP login user
	 * @type {string}
	 */
	user;
	/**
	 * The ERP login user password
	 * @type {string}
	 */
	password;
	/**
	 * .BSMAuthCookie session cookie used in API calls
	 * @type {string}
	 */
	cookie;
	/**
	 * cached users
	 * @type {string[]}
	 */
	cachedUsers;
	/**
	 * cached vessels
	 * @type {string[]}
	 */
	cachedVessels;

	/**
	 * Logs in to PAL using provided credentials, retrieves the session cookie and sets the cookie property
	 */
	getCookie() {
		return getCookie.call(this);
	}

	/**
	 * Gets all the vessels' port call schedule for the next month
	 * @param {days} days how many days ahead to check
	 * @return {Promise<Array>} Array of objects, each containing a port call
	 */
	getVesselSchedule(days) {
		return getVesselSchedule.call(this, days);
	}

	// TODO TS type definitions
	/**
	 * Gets PAL Purchase documents from General Query
	 * @param {Array} vessels Array of vessel names: ["CHEM MIA", "CHEM ZEALOT"]
	 * @param {number} year
	 * @param {number} docType Requisition: 1, PO: 4
	 * @param {Array} categories Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @returns {Promise<{DocId:number,DocCode:string,DocNo:string,RequsitionId:number,RequsitionCode:string,RequsitionTitle:string,RequsitionStatus:string|null }[]>} Array of objects, each containing a document
	 */
	generalQuery(vessels, year, docType, categories) {
		return generalQuery.call(this, vessels, year, docType, categories);
	}

	/**
	 * Gets all the PSC reports available in PAL
	 * @return {Promise<{  Id: number,ReportTypeId: number,ReportType: string,ReportSubTypeId: number,ReportSubType: string,RefNo: string,InspectionDate: string,InspectorName: string,UnitType:string,Unit:string,VesselStatus:string,NoOfDeficiencies:number, NoOfOpenDeficiencie:number, Status:string,Result:string, pscmou:string, ReportStatus:string,StatusDate:string, Port:string}[]>} Array of objects, each containing an inspection report
	 */
	getPSCreports() {
		return getPSCreports.call(this);
	}

	/**
	 * Gets all the vessels in PAL
	 * @return {Promise<{Id: number,VesselId: number,VesselObjectId: number,VesselName: string,ApprovalCycleTemplateId: number,ApprovalTemplateId: number,StopProcess: boolean,ModifiedById: number,ModifiedOn: string,IsSelected: boolean,SNo: number}[]>} Array of vessel objects
	 */
	getVessels() {
		return getVessels.call(this);
	}

	/**
	 * Transforms an array of vessel names to a string of VesselObjectIds to be used in other methods
	 * @private
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of VesselObjectIds as string: "246049,246026"
	 */
	vesselNamesToObjectIds(vesselsArray) {
		return vesselNamesToObjectIds.call(this, vesselsArray);
	}

	/**
	 * Transforms an array of vessel names to a string of VesselIds to be used in other methods
	 * @private
	 * @param {array} myVessels Array of vessel names: ["CHEM HOUSTON", "CHEM MIA"]
	 * @return {Promise<string>} List of VesselIds as string: "246049,246026"
	 */
	vesselNamesToIds(vesselsArray) {
		return vesselNamesToIds.call(this, vesselsArray);
	}

	/**
	 * Gets all the vessels in PAL
	 * @param {string} docType "PROC" or "JOB"
	 * @return {Promise<{Selected: boolean, Text: string, Value: string}[]>} Array of objects, each containing a Purchase category
	 * @example [{"Selected":false,"Text":"MEDICINE","Value":"201205"},{"Selected":false,"Text":"PROVISIONS","Value":"201184"}]
	 */
	getPurchaseCategories(docType) {
		return getPurchaseCategories.call(this, docType);
	}

	/**
	 * Transforms an array of Purchase categories names to a string of IDs to be used in other methods
	 * @private
	 * @param {array} Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
	 * @param {string} docType "PROC" or "JOB"
	 * @return {Promise<string>} List of Ids as string: "201205,201184"
	 */
	categoriesNamesToIds(categoriesArray, docType) {
		return categoriesNamesToIds.call(this, categoriesArray, docType);
	}

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
	purchaseAllocation(docType, vessel, category, role, users, template) {
		return purchaseAllocation.call(this, docType, vessel, category, role, users, template);
	}

	/**
	 * Gets all the Purchase users in PAL
	 * @return {Promise<{UserId: number, LoginName: string, Name: string, Active: boolean, CompanyId: number, Email: string, SelectedUser: boolean, SNo: number}[]>} Array of objects, each containing a user
	 */
	getUsers() {
		return getUsers.call(this);
	}

	/**
	 * Transforms an array/string of usernames to a string of Ids to be used in other allocation methods
	 * @private
	 * @param {Array<string>} usr String or array of users names: ["Bogdan", "Helen"]
	 * @return {Promise<{id: string, username: string}>} Object with 2 strings: {id: "110531,489954", username: "Bogdan Lazar, Lidia Haile"}
	 */
	usersToIdAndUserName(usr) {
		return usersToIdAndUserName.call(this, usr);
	}

	/**
	 * Get the current Purchase allocation
	 * @param {string} docType "PROC" or "JOB"
	 * @param {number} vesselId VesselId
	 * @param {number} vesselObjectId VesselObjectId
	 * @param {number} categoryId CategoryId
	 * @return {Promise<{ApprovalCycleTemplateId: number, ApprovalTemplateId: number, VesselAllocationId: number, roles: {Id: number, Code: string, Name: string, UserIds: string, UserNames: string,}[]}>}
	 */
	getCurrentPRCallocation(docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId = "") {
		return getCurrentPRCallocation.call(this, docType, vesselId, vesselObjectId, categoryId, ApprovalCycleTemplateId);
	}

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
	isPRCallocSuccessful(docType, ApprovalCycleTemplateId, ApprovalTemplateId, RoleId, UserIds, VesselAllocationId, vesselId, vesselObjectId, categoryId) {
		return isPRCallocSuccessful.call(
			this,
			docType,
			ApprovalCycleTemplateId,
			ApprovalTemplateId,
			RoleId,
			UserIds,
			VesselAllocationId,
			vesselId,
			vesselObjectId,
			categoryId
		);
	}

	/**
	 * Get the IDs of all the cycle templates
	 * @private
	 * @return {Promise<{ Id: number, Name: string, CompanySel: string }[]>}
	 */
	getPRCcycleTemplateIds() {
		return getPRCcycleTemplateIds.call(this);
	}

	/**
	 * Replace current Voyage User Alert Configuration
	 * @param {string} vessel
	 * @param {string} role
	 * @param {string | string[]} users
	 * @return {Promise<boolean>} success or not
	 */
	voyageAlertConfig(vessel, role, users) {
		return voyageAlertConfig.call(this, vessel, role, users);
	}

	/**
	 * Get all the Voyage alert roles
	 * @private
	 * @param {number} vslId
	 * @param {number} vslObjectId
	 * @return {Promise<{VessleId:number,VessleObjectId:number,AlertRoleName:string,AlertRoleId:number,UserIds:string,UserNames:string}[]>} Array of Voyage alert role objects
	 */
	getVoyAlertRoles(vslId, vslObjectId) {
		return getVoyAlertRoles.call(this, vslId, vslObjectId);
	}

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
	addCrewAllocation(roleId, userIds, userName, vslId, vslObjectId, processId) {
		return addCrewAllocation.call(this, roleId, userIds, userName, vslId, vslObjectId, processId);
	}

	/**
	 * Get all the Crewing processes and their IDs
	 * @private
	 * @return {Promise<Object[]>} Array of Voyage alert role objects
	 */
	getCrewingProcesses() {
		return getCrewingProcesses.call(this);
	}

	/**
	 * Get the Crewing roles for the given vessel and Crewing process
	 * @private
	 * @param {number} VesselId
	 * @param {number} VesselObjectId
	 * @param {number} processId
	 * @return {Promise<Object[]>} Array of Voyage alert role objects
	 */
	getAllocatedUsers(VesselId, VesselObjectId, processId) {
		return getAllocatedUsers.call(this, VesselId, VesselObjectId, processId);
	}

	/**
	 * Remove MDM Crewing user from given fid
	 * @private
	 * @param {number} fid
	 * @return {Promise<boolean>} success or not
	 */
	removeCrewingAllocation(fid) {
		return removeCrewingAllocation.call(this, fid);
	}

	/**
	 * Replace current Crew process allocation for the vessel and role
	 * @param {string} vessel
	 * @param {string} process
	 * @param {string} role
	 * @param {string | Array<string>} inputUsers Users not in the array will be removed
	 * @return {Promise<boolean>} success or not
	 */
	crewAllocation(vessel, process, role, inputUsers) {
		return crewAllocation.call(this, vessel, process, role, inputUsers);
	}

	/**
	 * Gets all the roles in Crewing
	 * @return {Promise<{Id: number,Code: string,Name: string,RoleLevel: number,Active: boolean,Is_Active: boolean}[]>} Array of objects, each containing a role
	 */
	getCrewingRoles() {
		return getCrewingRoles.call(this);
	}

	/**
	 * Returns the cumulated IMO DCS voyages consumptions for the given vessel and, optionally, year.
	 * It will normally run from 1 Jan of current year until given date, unless the year is also specified
	 * @param {string} vesselName
	 * @param {Date} date - JavaScript Date object
	 * @param {boolean} runFromPrevYear - default false. set to true if to run from previous year
	 * @return {Promise<{vessel: string, startDate: string, endDate: string, distance: number, totalHFO: number, totalLFO: number, totalMDO: number,hrsAtSea:number}[]>} Object with results:
	 */
	imoDcs(vesselName, date, runFromPrevYear = false) {
		return imoDcs.call(this, vesselName, date, runFromPrevYear);
	}

	/**
	 * Gets planned crew changes
	 * @param {string[]} vessels Array of vessel names
	 * @param {Date} date JS date object. Probably today()
	 * @param {number} daysAhead how many days to look ahead
	 * @param {number[]} ranks array of codes representing the ranks 1 - CPT, 31 - C/E
	 * @return {Promise<{vessel: string,rank: string,offName: string,offDueDate: string,plannedRelief: string,onName: string,onPhone: string,onMobile: string,onEmail: string,onSkype:string,onJoinDate:string,port: string,remarks:string,onCrewAgent:string,offCrewAgent:string}[]>} Array of objects, each containing a crew change
	 */
	getPlannedCrewChanges(vessels, date, daysAhead, ranks) {
		return getPlannedCrewChanges.call(this, vessels, date, daysAhead, ranks);
	}

	/**
	 * Gets some seafarer contact details based on employee ID (internal code)
	 * @private
	 * @param {number} empId employee ID
	 * @return {Promise<{email:string,phone:string,mobile:string,address:string,skype:string}>} Seafarer object with contact details
	 */
	getSeafarerContacts(empId) {
		return getSeafarerContacts.call(this, empId);
	}

	/**
	 * Get all the drills for given vessel from PAL QHSE
	 * @param {string} vesselName vessel name
	 * @return {Promise<{DrillName:string,ReferenceNo:string,DrillCategoryId:number,DrillId:number,VesselObjectId:number,Vessel:string,AlarmSoundedTime:string,DrillStatus:string}[]>} Array of drill objects
	 */
	getDrills(vesselName) {
		return getDrills.call(this, vesselName);
	}

	/**
	 * Get the pending list for Purchase docId and docType
	 * @param {number} docId
	 * @param {string} docType - "PO" or "QC"
	 * @return {Promise<{Id: number,Document:string,Code:string,TakenBy:string,ActionDate:string,Status:string,Remarks:string,ForwardBy:string}[]>} Array of actions objects
	 */
	getPendingList(docId, docType) {
		return getPendingList.call(this, docId, docType);
	}

	// TODO leg object type
	/**
	 * Returns the cumulated EU MRV voyages consumptions for the given vessel and, optionally, year.
	 * It will normally run from 1 Jan of current year until given date, unless the year is also specified
	 * @param {string} vesselName
	 * @param {Date} date - JavaScript Date object
	 * @param {boolean} runFromPrevYear - default false. set to true if to run from previous year
	 * @return {Promise<{vessel: string, startDate: string, endDate: string, legs: Object[]}>} Object with results
	 */
	eumrv(vesselName, date, runFromPrevYear = false) {
		return eumrv.call(this, vesselName, date, runFromPrevYear);
	}

	/**
	 * Returns the QDMS documents in a given folderId for given page and pageSize
	 * It is intended to be used in a loop to get all the documents in a folder
	 * @private
	 * @param {string} folderId
	 * @param {number} page
	 * @param {number} pageSize
	 * @return {Promise<{Data: {CreatedBy: string;CreatedOn: string;DocFolder: string;DocNo: string;DocSite: string;Doctitle: string;ID: number;Revision: number}[], Total: number}} Object with results
	 */
	getQDMSfolderDocsPerPage(folderId, page, pageSize) {
		return getQDMSfolderDocsPerPage.call(this, folderId, page, pageSize);
	}

	/**
	 * Get all the documents in a given QDMS folder, by its internal folder ID
	 * @param {number} folderId
	 * @return {Promise<{CreatedBy: string;CreatedOn: string;DocFolder: string;DocNo: string;DocSite: string;Doctitle: string;ID: number;Revision: number}[]>} Array of QDMS documents objects
	 */
	getQDMSdocsByFolderId(folderId) {
		return getQDMSdocsByFolderId.call(this, folderId);
	}
}

export * from "./Common/utils.js";
