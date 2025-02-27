/**
*  @filename    Duriel.js
*  @author      kolton, theBGuy
*  @desc        kill Duriel
*
*/

function Duriel () {
	this.killDuriel = function () {
		let target = Misc.poll(() => montser(sdk.monsters.Duriel), 1000, 200);

		if (!target) throw new Error("Duriel not found.");

		Config.MFLeader && Pather.makePortal() && say("kill " + 211);

		for (let i = 0; i < 300 && target.attackable; i += 1) {
			ClassAttack.doAttack(target);
			target.distance <= 10 && Pather.moveTo(22638, me.y < target.y ? 15722 : 15693);
		}

		return target.dead;
	};

	if (me.area !== sdk.areas.CanyonofMagic) {
		Town.doChores();
		Pather.useWaypoint(sdk.areas.CanyonofMagic);
	}

	Precast.doPrecast(true);

	if (!Pather.moveToExit(getRoom().correcttomb, true)) throw new Error("Failed to move to Tal Rasha's Tomb");
	if (!Pather.moveToPreset(me.area, 2, sdk.quest.chest.HoradricStaffHolder, -11, 3)) throw new Error("Failed to move to Orifice");

	me.hardcore && !me.sorceress && Attack.clear(5);

	let unit = object(sdk.units.PortaltoDurielsLair);

	if (Skill.useTK(unit)) {
		Misc.poll(function () {
			Skill.cast(sdk.skills.Telekinesis, 0, unit) && delay(100);
			return me.area === sdk.areas.DurielsLair;
		}, 1000, 200);
	}

	if (me.area !== sdk.areas.DurielsLair && (!unit || !Pather.useUnitEx({unit: unit}, sdk.areas.DurielsLair))) {
		Attack.clear(10);
		Pather.useUnit(sdk.unittype.Object, sdk.units.PortaltoDurielsLair, sdk.areas.DurielsLair);
	}

	if (me.area !== sdk.areas.DurielsLair) throw new Error("Failed to move to Duriel");

	me.sorceress && me.classic ? this.killDuriel() : Attack.kill(sdk.monsters.Duriel);
	Pickit.pickItems();

	return true;
}
