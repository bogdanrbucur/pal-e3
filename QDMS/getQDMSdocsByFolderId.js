/**
 * Get all the documents in a given QDMS folder, by its internal folder ID
 * @param {number} folderId
 * @return {Promise<{CreatedBy: string;CreatedOn: string;DocFolder: string;DocNo: string;DocSite: string;Doctitle: string;ID: number;Revision: number}[]>} Array of QDMS documents objects
 */
export default async function getQDMSdocsByFolderId(folderId) {
	let page = 1;
	const pageSize = 200;

	const response = await this.getQDMSfolderDocsPerPage(folderId, page, pageSize);
	const noOfRecords = response.Total;

	// get all the documents, on all pages, until all are received
	let allRecords = response.Data;
	while (noOfRecords > page * pageSize) {
		page++;
		const newPage = await this.getQDMSfolderDocsPerPage(folderId, page, pageSize);
		newPage.Data.forEach((r) => {
			allRecords.push(r);
		});
	}
	console.log(`Returned ${allRecords.length} documents`);
	return allRecords;
}
