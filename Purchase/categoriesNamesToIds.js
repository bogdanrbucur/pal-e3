/**
 * Transforms an array of Purchase categories names to a string of IDs to be used in other methods
 * @private
 * @param {array} Array of Purchase categories names: ["MEDICINE", "PROVISIONS"]
 * @param {string} docType "PROC" or "JOB"
 * @return {Promise<string>} List of Ids as string: "201205,201184"
 */
export default async function categoriesNamesToIds(categoriesArray, docType) {
	// Select Any is category 0
	if (typeof categoriesArray === "string" && categoriesArray.toUpperCase() === "SELECT ANY") return 0;

	// make sure the input categori(es) are all UpperCase
	if (typeof categoriesArray === "string") categoriesArray = categoriesArray.toUpperCase();
	else categoriesArray = categoriesArray.map((cat) => cat.toUpperCase());

	let categories = await this.getPurchaseCategories(docType);
	let filteredCategories = categories.filter((cat) => categoriesArray.includes(cat.Text.toUpperCase()));
	let categoriesString = "";
	filteredCategories.forEach((cat) => {
		categoriesString += cat.Value += ",";
	});
	categoriesString = categoriesString.slice(0, -1);

	if (categoriesString === "") throw new Error("Category not found!");
	return categoriesString;
}
