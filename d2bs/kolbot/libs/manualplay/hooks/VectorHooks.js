/*
*	@filename	VectorHooks.js
*	@author		theBGuy
*	@desc		Vector hooks for MapThread
*/

const VectorHooks = {
	enabled: true,
	currArea: 0,
	lastLoc: {x: 0, y: 0},
	names: [],
	hooks: [],

	check: function () {
		if (!this.enabled) {
			this.flush();

			return;
		}

		if (me.area !== this.currArea) {
			this.flush();

			let i, exits, wp, poi,
				nextAreas = [];

			// Specific area override
			nextAreas[7] = 26;
			nextAreas[76] = 78;
			nextAreas[77] = 78;
			nextAreas[113] = 115;
			nextAreas[115] = 117;
			nextAreas[118] = 120;
			nextAreas[131] = 132;

			if (!me.area || !me.gameReady) {
				return;
			}

			try {
				exits = getArea().exits;
				this.currArea = me.area;

				if (exits) {
					for (i = 0; i < exits.length; i++) {
						if (me.area === 46) {
							this.add(exits[i].x, exits[i].y, exits[i].target === getRoom().correcttomb ? 0x69 : 0x99);
						} else if (exits[i].target === nextAreas[me.area] && nextAreas[me.area]) {
							this.add(exits[i].x, exits[i].y, 0x1F);
						} else if (exits[i].target === ActionHooks.prevAreas.indexOf(me.area) && nextAreas[me.area]) {
							this.add(exits[i].x, exits[i].y, 0x99);
						} else if (exits[i].target === ActionHooks.prevAreas.indexOf(me.area)) {
							this.add(exits[i].x, exits[i].y, 0x1F);
						} else if (exits[i].target === ActionHooks.prevAreas[me.area]) {
							this.add(exits[i].x, exits[i].y, 0x0A);
						} else {
							this.add(exits[i].x, exits[i].y, 0x99);
						}

						this.addNames(exits[i]);
					}
				}

				wp = this.getWP();
				wp && this.add(wp.x, wp.y, 0xA8);
				poi = this.getPOI();
				poi && this.add(poi.x, poi.y, 0x7D);
			} catch (e) {
				print(e);
			}
		} else if (me.x !== this.lastLoc.x || me.y !== this.lastLoc.y) {
			this.update();
		}
	},

	add: function (x, y, color) {
		this.hooks.push(new Line(me.x, me.y, x, y, color, true));
	},

	addNames: function (area) {
		this.names.push(new Text(Pather.getAreaName(area.target), area.x, area.y, 0, 6, 2, true));
	},

	update: function () {
		this.lastLoc = {x: me.x, y: me.y};

		for (let i = 0; i < this.hooks.length; i++) {
			this.hooks[i].x = me.x;
			this.hooks[i].y = me.y;
		}
	},

	flush: function () {
		while (this.hooks.length) {
			this.hooks.shift().remove();
		}

		while (this.names.length) {
			this.names.shift().remove();
		}

		this.currArea = 0;
	},

	getWP: function () {
		if (Pather.wpAreas.indexOf(me.area) === -1) {
			return false;
		}

		let i, preset,
			wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

		for (i = 0; i < wpIDs.length; i += 1) {
			preset = getPresetUnit(me.area, 2, wpIDs[i]);

			if (preset) {
				return {
					x: preset.roomx * 5 + preset.x,
					y: preset.roomy * 5 + preset.y
				};
			}
		}

		return false;
	},

	getPOI: function () {
		let unit, name;
		let poi = {};

		switch (me.area) {
		case 13: // Cave Level 2
		case 15: // Hole Level 2
		case 16: // Pit Level 2
		case 18: // Crypt
		case 19: // Mausoleum
		case 59: // Stony Tomb Level 2
		case 65: // Ancient Tunnels
		case 77: // Great Marsh
		case 84: // Spider Cave
		case 90: // Swampy Pit Level 3
		case 95: // Disused Fane
		case 96: // Forgotten Reliquary
		case 97: // Forgotten Temple
		case 99: // Disused Reliquary
		case 116: // Drifter Cavern
		case 119: // Icy Cellar
		case 125: // Abadon
		case 126: // Pit of Acheron
		case 127: // Infernal Pit
			unit = getPresetUnit(me.area, 2, 397);
			poi = {name: "SuperChest", action: {do: "openChest", id: 397}};

			break;
		case 115: // Glacial Trail
		case 122: // Halls of Anguish
		case 123: // Halls of Pain
			unit = getPresetUnit(me.area, 2, 455);
			poi = {name: "SuperChest", action: {do: "openChest", id: 455}};

			break;
		case 3: // Cold Plains
			unit = getPresetUnit(me.area, 5, 2);

			if (!unit) {
				unit = getPresetUnit(me.area, 5, 3);
			}

			name = "Cave Level 1";

			break;
		case 4: // Stony Field
			unit = getPresetUnit(me.area, 1, 737);
			poi = {name: "Cairn Stones", action: {do: "usePortal", id: 38}};

			break;
		case 5: // Dark Wood
			unit = getPresetUnit(me.area, 2, 30);
			name = "Tree";

			break;
		case 6: // Black Marsh
			unit = getPresetUnit(me.area, 5, 2);

			if (!unit) {
				unit = getPresetUnit(me.area, 5, 3);

				if (!unit) {
					unit = getPresetUnit(me.area, 5, 1);
				}
			}

			name = "Hole Level 1";

			break;
		case 8: // Den of Evil
			unit = getPresetUnit(me.area, 1, 774);
			name = "Corpsefire";

			break;
		case 17: // Bloodraven
			unit = getPresetUnit(me.area, 1, 805);
			name = "Bloodraven";

			break;
		case 25: // Countess
			unit = getPresetUnit(me.area, 2, 580);
			name = "Countess";

			break;
		case 28: // Smith
			unit = getPresetUnit(me.area, 2, 108);
			name = "Smith";

			break;
		case 33: // BoneAsh
			unit = {x: 20047, y: 4898};
			name = "BoneAsh";

			break;
		case 37: // Andariel
			unit = {x: 22549, y: 9520};
			name = "Andariel";

			break;
		case 38: // Griswold
			unit = getUnit(1, 365) ? getUnit(1, 365) : {x: 25163, y: 5170};
			name = "Griswold";

			break;
		case 39: // Cow King
			unit = getUnit(1, 743) ? getUnit(1, 743) : getPresetUnit(me.area, 1, 773);
			name = "Cow King";

			break;
		case 40: // Lut Gholein
			unit = getPresetUnit(me.area, 5, 20);
			name = "Sewer's Level 1";

			break;
		case 49: // Sewers 3
			unit = getPresetUnit(me.area, 2, 355);
			name = "Radament";

			break;
		case 54: // Arcane Sanctuary
			unit = {x: 10073, y: 8670};
			poi = {name: "Arcane Sanctuary", action: {do: "usePortal"}};

			break;
		case 60: // Halls of the Dead 3
			unit = getPresetUnit(me.area, 2, 354);
			poi = {name: "Cube", action: {do: "openChest", id: 354}};

			break;
		case 61: // Claw Viper Temple 2
			unit = getPresetUnit(me.area, 2, 149);
			poi = {name: "Amulet", action: {do: "openChest", id: 149}};

			break;
		case 64: // Maggot Lair 3
			unit = getPresetUnit(me.area, 2, 356);
			poi = {name: "Staff", action: {do: "openChest", id: 356}};

			break;
		case 74: // Arcane Sanctuary
			unit = getPresetUnit(me.area, 2, 357);
			name = "Summoner";

			break;
		case 66: // Tal Rasha's Tombs
		case 67:
		case 68:
		case 69:
		case 70:
		case 71:
		case 72:
			unit = getPresetUnit(me.area, 2, 152);
			name = "Orifice";

			if (!unit) {
				unit = getPresetUnit(me.area, 2, 397);
				name = "SuperChest";
			}

			break;
		case 73: // Duriels Lair
			unit = {x: 22577, y: 15609};
			name = "Tyrael";

			break;
		case 78: // Flayer Jungle
			unit = getPresetUnit(me.area, 2, 252);
			name = "Gidbinn";

			break;
		case 80: // Sewer's Level 1
			unit = getPresetUnit(me.area, 5, 57);
			name = "Sewer's Level 1";

			break;
		case 85: // Spider Cavern
			unit = getPresetUnit(me.area, 2, 407);
			poi = {name: "Eye", action: {do: "openChest", id: 407}};

			break;
		case 91: // Flayer Dungeon Level 3
			unit = getPresetUnit(me.area, 2, 406);
			poi = {name: "Brain", action: {do: "openChest", id: 406}};

			break;
		case 93: // A3 Sewer's Level 2
			unit = getPresetUnit(me.area, 2, 405);
			poi = {name: "Heart", action: {do: "openChest", id: 405}};

			break;
		case 94: // Ruined Temple
			unit = getPresetUnit(me.area, 2, 193);
			poi = {name: "Lam Esen", action: {do: "openChest", id: 193}};

			break;
		case 83: // Travincal
			unit = getPresetUnit(me.area, 2, 404);
			name = "Orb";

			break;
		case 102: // Durance of Hate 3
			unit = {x: 17588, y: 8069};
			name = "Mephisto";

			break;
		case 105: // Plains of Despair
			unit = getPresetUnit(me.area, 1, 256);
			name = "Izual";

			break;
		case 107: // River of Flame
			unit = getPresetUnit(me.area, 2, 376);
			name = "Hephasto";

			break;
		case 108: // Chaos Sanctuary
			unit = getPresetUnit(me.area, 2, 255);
			name = "Star";

			break;
		case 109: // Anya Portal
			unit = {x: 5112, y: 5120};
			poi = {name: "Anya Portal", action: {do: "usePortal", id: 121}};

			break;
		case 110: // Bloody Foothills
			unit = {x: 3899, y: 5113};
			name = "Shenk";

			break;
		case 111: // Frigid Highlands
		case 112: // Arreat Plateau
		case 117: // Frozen Tundra
			unit = getPresetUnit(me.area, 2, 60);
			poi = {name: "Hell Entrance", action: {do: "usePortal"}};

			break;
		case 114: // Frozen River
			unit = getPresetUnit(me.area, 2, 460);
			name = "Frozen Anya";

			break;
		case 121: // Nihlathaks Temple
			unit = {x: 10058, y: 13234};
			name = "Pindle";

			break;
		case 124: // Halls of Vaught
			unit = getPresetUnit(me.area, 2, 462);
			name = "Nihlathak";

			break;
		case 131: // Throne of Destruction
			unit = {x: 15118, y: 5002};
			name = "Throne Room";

			break;
		case 132: // Worldstone Chamber
			unit = getUnit(1, 544) ? getUnit(1, 544) : {x: 15134, y: 5923};
			name = "Baal";

			break;
		case 133: // Matron's Den
			unit = getPresetUnit(me.area, 2, 397);
			name = "Lilith";

			break;
		case 134: // Forgotten Sands
			unit = getUnit(1, 708);
			name = "Duriel";

			break;
		case 135: // Furnace of Pain
			unit = getPresetUnit(me.area, 2, 397);
			name = "Izual";

			break;
		}

		if (unit) {
			name && !poi.name && (poi.name = name);
			
			if (unit instanceof PresetUnit) {
				poi.x = unit.roomx * 5 + unit.x;
				poi.y = unit.roomy * 5 + unit.y;
			} else {
				poi.x = unit.x;
				poi.y = unit.y;
			}

			return poi;
		}

		return false;
	}
};
