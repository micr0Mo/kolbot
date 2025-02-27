/**
*  @filename    Abaddon.js
*  @author      kolton
*  @desc        clear Abaddon
*
*/

function Abaddon() {
	Town.doChores();
	Pather.useWaypoint(sdk.areas.FrigidHighlands);
	Precast.doPrecast(true);

	if (!Pather.moveToPreset(sdk.areas.FrigidHighlands, 2, sdk.units.RedPortal) || !Pather.usePortal(sdk.areas.Abaddon)) {
		throw new Error("Failed to move to Abaddon");
	}

	Attack.clearLevel(Config.ClearType);

	return true;
}
