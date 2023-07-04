import PAL from "./pal.js";

const pal = new PAL();
pal.url = "https://palapp.asm-maritime.com";
pal.user = "";
pal.password = "";


const main = async () => {
	await pal.getCookie();
  let schedule = await pal.getVesselSchedule();
	console.log(schedule);
};

main();
