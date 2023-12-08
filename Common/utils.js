/**
 * Transform JavaScript Date objects to DD-MMM-YYYY strings
 * @param {Date} input JavaScript Date object
 * @return {string} String in format DD-MMM-YYYY
 */
export function dateToString(input) {
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let day = input.getDate();
	return `${String(day).padStart(2, "0")}-${months[input.getMonth()]}-${input.getFullYear()}`;
}

/**
 * Transform strings DD-MMM-YYYY or DDMMYYYY to JavaScript Date objects
 * @param {string} input Date in format DD-MMM-YYYY or DDMMYYYY
 * @return {Date} JavaScript Date object. If input is invalid, it returns date 1 Jan 1970
 */
export function stringToDate(input) {
	if (input.length === 8) {
		let year = input.slice(4, 8);
		let month = input.slice(2, 4) - 1;
		let day = input.slice(0, 2);
		return new Date(year, month, day);
	}
	if (input.length !== 11 && input.length !== 17) {
		console.error(`stringToDate bad input! Accepts only DD-MMM-YYYY or DDMMYYYY or DD-MMM-YYYY HH:mm`);
		return new Date(0);
	}
	return new Date(`${input.slice(7, 11)}, ${input.slice(3, 6)}, ${input.slice(0, 2)}`);
}

/**
 * Slice strings from DD-MMM-YYYY hh:mm:ss to DD-MMM-YYYY
 * @param {string} input String in format DD-MMM-YYYY hh:mm:ss
 * @return {string} String in format DD-MMM-YYYY
 */
export function shortDate(input) {
	return input.slice(0, 11);
}

/**
 * Get the port out of a port-country string
 * @param {string} input String in format Antwerp {BEANR}, BELGIUM
 * @return {string} String in format Antwerp
 */
export function getPort(input) {
	return input.split(",")[0].split("{")[0].trim();
}

/**
 * Get the country out of a port-country string
 * @param {string} input String in format Antwerp {BEANR}, BELGIUM
 * @return {string} String in format BELGIUM
 */
export function getCountry(input) {
	return input.split(",")[1].trim();
}

/**
 * Get the country out of a port-country string
 * @param {Date} date1 JavaScript Date object
 * @param {Date} date2 JavaScript Date object. If undefined, it's replaced with 1 Jan 1970
 * @return {float} Float with difference in months between dates, with 2 decimal precision
 */
export function dateDiffInMonths(date1, date2) {
	if (typeof date2 == undefined) {
		date2 = new Date("1970-01-01");
	}
	return parseFloat(Math.abs((date1 - date2) / 1000 / 60 / 60 / 24 / 30).toPrecision(3));
}

/**
 * Get a log filename with today's date
 * @return {string} String with today's file name: YYYY.MM.DD.log
 */
export function logDate() {
	let logDate = new Date();
	logDate = `${logDate.getFullYear()}.${String(logDate.getMonth() + 1).padStart(2, "0")}.${String(logDate.getDate()).padStart(2, "0")}.log`;
	return logDate;
}

/**
 * Transform date string DD-MMM-YYYY to string DDMMYYY
 * @param {string} input String in format DD-MMM-YYYY
 * @return {string} String in format DDMMYYYY, ready to be input into PAL e3 date fields
 */
export function toInputDate(input) {
	return input
		.slice(0, -6)
		.replace("-", "")
		.replace("-", "")
		.replace("Dec", "12")
		.replace("Nov", "11")
		.replace("Oct", "10")
		.replace("Sep", "09")
		.replace("Aug", "08")
		.replace("Jul", "07")
		.replace("Jun", "06")
		.replace("May", "05")
		.replace("Apr", "04")
		.replace("Mar", "03")
		.replace("Feb", "02")
		.replace("Jan", "01");
}

/**
 * Get 01MMYYYY of current month
 * @return {string} String 01MMYYYY of current month
 */
export function firstCurrentMonth() {
	let today = new Date();
	let mm2 = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	let yyyy2 = today.getFullYear().toString().slice(0);
	let anotherDate = "01" + mm2 + yyyy2;
	// console.log(anotherDate);
	return anotherDate;
}

/**
 * Get 02MMYY of previous month
 * @return {string} String 01MMYY of previous month
 */
export function secondLastMonth() {
	let today = new Date();
	today.setDate(0); // 0 will result in the last day of the previous month
	today.setDate(1); // 1 will result in the first day of the month
	today.setDate(2); // 2 will result in the second day of the month
	let dd3 = String(today.getDate()).padStart(2, "0");
	let mm3 = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	let yy3 = today.getFullYear().toString().slice(2);
	let localDate = dd3 + mm3 + yy3;
	// console.log(localDate);
	return localDate;
}

/**
 * Get 0101YYYY of the previous month
 * Return 01012022 if current month is Jan 2023. Return 01012023 if current month is Feb 2023
 * @return {string} String 0101YYYY of the previous month
 */
export function previous1Jan() {
	let today = new Date();
	today.setDate(0); // 0 will result in the last day of the previous month
	// console.log(`0101${today.getFullYear()}`);
	return `0101${today.getFullYear()}`;
}

/**
 * Get a string with today's date
 * @return {string} String with today's date DDMMYYYY
 */
export function todayDDMMYYYY() {
	let logDate = new Date();
	logDate = String(logDate.getDate()).padStart(2, "0") + String(logDate.getMonth() + 1).padStart(2, "0") + String(logDate.getFullYear());
	return logDate;
}

/**
 * Transform JavaScript Date objects to DDMMYYYY strings
 * @param {Date} input JavaScript Date object
 * @return {string} String in format DDMMYYYY
 */
export function jsDateToInputString(input) {
	return `${String(input.getDate(input)).padStart(2, "0")}${String(input.getMonth(input) + 1).padStart(2, "0")}${input.getFullYear()}`;
}

/**
 * Transform date from DDMMYYYY to DD-MMM-YYYY 07:00
 * @param {string} input String in format DDMMYYYY
 * @return {string} String in format DD-MMM-YYYY 07:00
 */
export function inputStringToOutputString(input) {
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return `${input.slice(0, 2)}-${months[input.slice(2, 4) - 1]}-${input.slice(4, 8)} 07:00`;
}
