/**
*  @filename    Bonesaw.js
*  @author      kolton
*  @desc        kill Bonesaw Breaker
*
*/

function Bonesaw() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.GlacialTrail);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(sdk.areas.GlacialTrail, 2, 455, 15, 15)) throw new Error("Failed to move to Bonesaw");

	Attack.kill(getLocaleString(sdk.locale.monsters.BonesawBreaker));
	Config.Bonesaw.ClearDrifterCavern && Pather.moveToExit(116, true) && Attack.clearLevel(Config.ClearType);

	return true;
}
