/**
 * Replace current Crew process allocation for the vessel and role
 * @param {string} vessel
 * @param {string} process
 * @param {string} role
 * @param {string | Array<string>} inputUsers Users not in the array will be removed
 * @return {Promise<boolean>} success or not
 */
export default async function crewAllocation(vessel, process, role, inputUsers) {
	console.time("Crew allocation");
	// If only one users is given, make it an array
	if (typeof inputUsers === "string") inputUsers = [`${inputUsers}`];

	// TODO calling the same API twice? ew...
	let vslId = await this.vesselNamesToIds(vessel);
	let vslObjectId = await this.vesselNamesToObjectIds(vessel);

	// get process ID
	let processesReponse = await this.getCrewingProcesses();

	let processId;
	processesReponse.forEach((resProc) => {
		if (resProc.Name.toUpperCase() === process.toUpperCase()) {
			processId = resProc.Id;
		}
	});
	if (processId === undefined) {
		throw new Error("Process not found!");
	}

	// get crew roles and ID
	let rolesResponse = await this.getAllocatedUsers(vslId, vslObjectId, processId);
	let allRolesResponse = await this.getCrewingRoles();

	// get roleId
	let roleId;
	allRolesResponse.forEach((resRole) => {
		if (resRole.Name.toUpperCase() === role.toUpperCase()) {
			roleId = resRole.Id;
		}
	});
	if (roleId === undefined) {
		throw new Error("Role not found!");
	}

	// Run through each already allocated user and check if it's in the input list
	// Add them to the list of users to be removed
	let usersToRemove = [];

	// * if all users need to be removed, i.e. inputUsers = ""
	if (inputUsers.length === 1 && inputUsers[0] === "") {
		console.log(`Will remove all users from role ${role.toUpperCase()}`);
		rolesResponse.forEach((allocatedUser) => {
			if (allocatedUser.Name.toUpperCase() === role.toUpperCase()) usersToRemove.push(allocatedUser);
		});
		// empty the array so the next functions don't run
		inputUsers.pop();
	}

	// * if inputUsers is something...
	rolesResponse.forEach((allocatedUser) => {
		const isMatch = inputUsers.some((word) => allocatedUser.UserNames.toUpperCase().includes(word.toUpperCase()));
		if (!isMatch && allocatedUser.Name.toUpperCase() === role.toUpperCase()) {
			usersToRemove.push(allocatedUser);
			console.log(`User ${allocatedUser.UserNames} will be removed`);
		}
	});
	let succesful = false;

	// Remove the users on the list
	for (const user of usersToRemove) {
		console.log(`Removing user ${user.UserNames}`);
		succesful = await this.removeCrewingAllocation(user.FId);
	}

	// get updated allocation if any user was removed
	if (usersToRemove.length !== 0) {
		console.log("Users removed, updating allocated users");
		rolesResponse = await this.getAllocatedUsers(vslId, vslObjectId, processId);
	}

	// Run through each already allocated user and check if it's in the input list
	// Add them to the list of users to be added
	let usersToAdd = [];

	inputUsers.forEach((user) => {
		// assume the user needs to be added
		let needToAddUser = true;

		rolesResponse.forEach((allocatedUser) => {
			// if the user is already allocated in the same role, no need to add him/her
			if (allocatedUser.UserNames.toUpperCase().includes(user.toUpperCase()) && allocatedUser.Name.toUpperCase() === role.toUpperCase()) needToAddUser = false;
		});
		if (needToAddUser) {
			// only add the user once
			if (!usersToAdd.includes(user)) {
				usersToAdd.push(user);
				console.log(`User ${user} will be added as ${role.toUpperCase()}`);
			}
		} else {
			console.log(`User ${user} already assigned in ${role.toUpperCase()} role`);
			succesful = true;
		}
	});

	// allocate the users
	for (const user of usersToAdd) {
		// get 2 strings: id and username
		let users = await this.usersToIdAndUserName(user);
		console.log(`Adding user ${users.username} in ${role.toUpperCase()} role...`);
		succesful = await this.addCrewAllocation(roleId, users.id, users.username, vslId, vslObjectId, processId);
	}

	console.timeEnd("Crew allocation");
	return succesful;
}
