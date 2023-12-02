import qs from "qs";
import axios from "axios";
import { dateToString } from "../Common/utils.js";

/**
 * Gets planned crew changes
 * @param {string[]} vessels Array of vessel names
 * @param {Date} date JS date object. Probably today()
 * @param {number} daysAhead how many days to look ahead
 * @param {number[]} ranks array of codes representing the ranks 1 - CPT, 31 - C/E
 * @return {Promise<{vessel: string,rank: string,offName: string,offDueDate: string,plannedRelief: string,onName: string,onPhone: string,onMobile: string,onEmail: string,onSkype:string,onJoinDate:string,port: string,remarks:string,onCrewAgent:string,offCrewAgent:string}[]>} Array of objects, each containing a crew change
 */
export default async function getPlannedCrewChanges(vessels, date, daysAhead, ranks) {
	console.time(`Crew planning request`);

	let daysFromNow = date.getDate() + daysAhead;

	// initialize as today and add daysAhead
	let toDate = new Date();
	toDate.setDate(daysFromNow);

	let data = {
		sort: "",
		page: 1,
		pageSize: 1000,
		group: "",
		filter: "",
		ownersArray: "",
		"sdcsArray[]": 1,
		ownersArray: "",
		fromDate: dateToString(date),
		toDate: dateToString(toDate),
		workGroupArray: "",
		rankArray: "",
		vslSubGroupArray: "",
		vslTypeArray: "",
		IsReliefDue: "true",
		Days: 12,
		ShowFullName: "Y",
		IsReliefDue: "true",
		IsMonths: "P",
		isShowClicked: "true",
		isShowClickedPageSize: "true",
		ExcludePlanned: "false",
		CheckLineUpCandidate: "N",
		CheckIncludeOnboard: "N",
		isMISRank: "N",
		ApprovedPlansOnly: "N",
		PendingPlansOnly: "N",
	};

	let vesselObjectIds = await this.vesselNamesToObjectIds(vessels);
	vesselObjectIds = vesselObjectIds.split(",");

	data = qs.stringify(data);

	// add vessels ObjectIds
	for (let vessel of vesselObjectIds) {
		data += `&vesselArray[]=${vessel}&commonVesselArray[]=${vessel}`;
	}

	// add ranks
	for (let rank of ranks) {
		data += `&rankGrpArray[]=${rank}`;
	}

	let options = {
		method: "POST",
		url: `${this.url}/palcrewing/CrewingPAL/Plan/GetCrewListForPlan`,
		headers: {
			Accept: "*/*",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.57",
			Cookie: `.BSMAuthCookie=${this.cookie}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		data: data,
	};

	let response = await axios.request(options);
	console.timeEnd(`Crew planning request`);
	console.log(`Returned ${response.data.Total} results`);

	const results = response.data.Data;

	// console.log(results);

	let responseArray = [];

	for (const r of results) {
		const relieverContacts = await this.getSeafarerContacts(r.RelieverEmpId);

		responseArray.push({
			vessel: r.Vessel,
			rank: r.Rank,
			offName: r.Offsigner,
			offDueDate: r.ReliefDue.slice(0, 11),
			plannedRelief: r.PlannedRelief,
			onName: r.Reliever,
			onPhone: relieverContacts.phone, //
			onMobile: relieverContacts.mobile, //
			onEmail: relieverContacts.email, //
			onSkype: relieverContacts.skype,
			onJoinDate: r.ExpJoiningDate,
			port: r.PlannedPort,
			remarks: r.RelieverRemarks,
			onCrewAgent: r.CscExt,
			offCrewAgent: r.oFF_CscExt,
		});
	}
	return responseArray;
}
