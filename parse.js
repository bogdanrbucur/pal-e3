// function to transform JS Date objects into PAL format dates DD-MMM-YYYY
export function dateToString(input) {
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let day = input.getDate();
	return `${String(day).padStart(2, "0")}-${months[input.getMonth()]}-${input.getFullYear()}`;
}
