/**
 * Returns the QDMS documents in a given folderId for given page and pageSize
 * It is intended to be used in a loop to get all the documents in a folder
 * @private
 * @param {string} folderId
 * @param {number} page
 * @param {number} pageSize
 * @return {Promise<{Data: {CreatedBy: string;CreatedOn: string;DocFolder: string;DocNo: string;DocSite: string;Doctitle: string;ID: number;Revision: number}[], Total: number}} Object with results
 */
export default async function getQDMSfolderDocsPerPage(folderId, page, pageSize) {
	// 6148 = Ports Information folder

	console.log(`Fetching QDMS documents in folder ID ${folderId} page ${page} of ${pageSize} records each`);

	// build the Form body
	let bodyFormData = new URLSearchParams();
	bodyFormData.append("sort", "");
	bodyFormData.append("page", page);
	bodyFormData.append("pageSize", pageSize);
	bodyFormData.append("group", "");
	bodyFormData.append("SelectedID", folderId);
	bodyFormData.append("Dateoption", "ALL");
	bodyFormData.append("FromDate", "01-Oct-2018");
	bodyFormData.append("Todate", "02-Nov-2025");
	bodyFormData.append("Allword", "");
	bodyFormData.append("phrase", "");
	bodyFormData.append("anyword", "");
	bodyFormData.append("noneWords", "");
	bodyFormData.append("Selectedfolder", "false");
	bodyFormData.append("VesselObjectID", "-1");
	bodyFormData.append("VesselTypeID", "-1");
	bodyFormData.append("Flag_ID", "-1");
	bodyFormData.append("ClassTypeID", "-1");
	bodyFormData.append("Applicable_To", "-1");
	bodyFormData.append("isMyVSl", "N");
	bodyFormData.append("companyList", "");
	bodyFormData.append("vesselList", "");
	bodyFormData.append("libraryID", "");

	const response = await fetch(`${this.url}/palqdms/QDMS/DocumentLibrary/DocumentList_Read`, {
		method: "POST",
		headers: { Cookie: `.BSMAuthCookie=${this.cookie}` },
		body: bodyFormData,
	});

	const body = await response.json();
	if (body.Errors) throw new Error(body.Errors);

	return body;
}
