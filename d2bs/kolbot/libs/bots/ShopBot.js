/**
*  @filename    ShopBot.js
*  @author      kolton, theBGuy
*  @desc        shop for items continually
*
*/

function ShopBot() {
	let overlayText = {
		title: new Text("kolbot shopbot", 50, 245, 2, 1),
		cycles: new Text("Cycles in last minute:", 50, 260, 2, 1),
		frequency: new Text("Valid item frequency:", 50, 275, 2, 1),
		totalCycles: new Text("Total cycles:", 50, 290, 2, 1),
	};

	let tickCount,
		cycles = 0,
		validItems = 0,
		totalCycles = 0;

	Pather.teleport = false;
	this.pickEntries = [];
	this.npcs = {};

	this.buildPickList = function () {
		let nipfile, filepath = "pickit/shopbot.nip",
			filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.length);

		if (!FileTools.exists(filepath)) {
			Misc.errorReport("ÿc1NIP file doesn't exist: ÿc0" + filepath);
			return false;
		}

		try {
			nipfile = File.open(filepath, 0);
		} catch (fileError) {
			Misc.errorReport("ÿc1Failed to load NIP: ÿc0" + filename);
		}

		if (!nipfile) return false;

		let lines = nipfile.readAllLines();
		nipfile.close();

		for (let i = 0; i < lines.length; i += 1) {
			let info = {
				line: i + 1,
				file: filename,
				string: lines[i]
			};

			let line = NTIP.ParseLineInt(lines[i], info);
			line && this.pickEntries.push(line);
		}

		return true;
	};

	this.openMenu = function (npc) {
		if (!npc || npc.type !== 1) throw new Error("Unit.openMenu: Must be used on NPCs.");

		let interactedNPC = getInteractedNPC();

		if (interactedNPC && interactedNPC.name !== npc.name) {
			sendPacket(1, 0x30, 4, interactedNPC.type, 4, interactedNPC.gid);
			me.cancel();
		}

		if (getUIFlag(0x08)) return true;

		for (let i = 0; i < 10; i += 1) {
			npc.distance > 5 && Pather.walkTo(npc.x, npc.y);

			if (!getUIFlag(0x08)) {
				sendPacket(1, 0x13, 4, 1, 4, npc.gid);
				sendPacket(1, 0x2f, 4, 1, 4, npc.gid);
			}

			let tick = getTickCount();

			while (getTickCount() - tick < Math.max(Math.round((i + 1) * 250 / (i / 3 + 1)), me.ping + 1)) {
				if (getUIFlag(0x08)) {
					return true;
				}

				delay(10);
			}
		}

		me.cancel();

		return false;
	};

	this.shopItems = function (npc, menuId) {
		let bought;

		if (!Storage.Inventory.CanFit({sizex: 2, sizey: 4}) && AutoMule.getMuleItems().length > 0) {
			D2Bot.printToConsole("Mule triggered");
			scriptBroadcast("mule");
			scriptBroadcast("quit");
			return true;
		}

		if (!npc) return false;

		for (let i = 0; i < 10; i += 1) {
			delay(150);

			i % 2 === 0 && sendPacket(1, 0x38, 4, 1, 4, npc.gid, 4, 0);

			if (npc.itemcount > 0) {
				break;
			}
		}

		let items = npc.getItemsEx().filter(function (item) {
			return (Config.ShopBot.ScanIDs.includes(item.classid) || Config.ShopBot.ScanIDs.length === 0);
		});

		if (!items.length) return false;

		me.overhead(npc.itemcount + " items, " + items.length + " valid");

		validItems += items.length;
		overlayText.frequency.text = "Valid base items / cycle: " + ((validItems / totalCycles).toFixed(2).toString());

		for (let i = 0; i < items.length; i += 1) {
			if (Storage.Inventory.CanFit(items[i]) && Pickit.canPick(items[i]) &&
					me.gold >= items[i].getItemCost(0) &&
					NTIP.CheckItem(items[i], this.pickEntries)
			) {
				beep();
				D2Bot.printToConsole("Match found!", 7);
				delay(1000);

				if (npc.startTrade(menuId)) {
					Misc.logItem("Shopped", items[i]);
					items[i].buy();
					bought = true;
				}

				Config.ShopBot.QuitOnMatch && scriptBroadcast("quit");
			}
		}

		if (bought) {
			me.cancelUIFlags();
			Town.stash();
		}

		return true;
	};

	this.shopAtNPC = function (name) {
		let wp, menuId = "Shop";

		switch (name) {
		case NPC.Charsi:
			menuId = "Repair";
		// eslint-disable-next-line no-fallthrough
		case NPC.Akara:
		case NPC.Gheed:
			wp = 1;

			break;
		case NPC.Fara:
			menuId = "Repair";
		// eslint-disable-next-line no-fallthrough
		case NPC.Elzix:
		case NPC.Drognan:
			wp = 40;

			break;
		case NPC.Hratli:
			menuId = "Repair";
		// eslint-disable-next-line no-fallthrough
		case NPC.Asheara:
		case NPC.Ormus:
			wp = 75;

			break;
		case NPC.Halbu:
			menuId = "Repair";
		// eslint-disable-next-line no-fallthrough
		case NPC.Jamella:
			wp = 103;

			break;
		case NPC.Larzuk:
			menuId = "Repair";
		// eslint-disable-next-line no-fallthrough
		case NPC.Malah:
		case NPC.Anya:
			wp = 109;

			break;
		default:
			throw new Error("Invalid NPC");
		}

		if (!Pather.useWaypoint(wp)) return false;

		let npc = this.npcs[name] || getUnit(1, name);

		if (!npc || npc.distance > 5) {
			Town.move(name);
			npc = getUnit(1, name);
		}

		if (!npc) return false;

		!this.npcs[name] && (this.npcs[name] = copyUnit(npc));
		Config.ShopBot.CycleDelay && delay(Config.ShopBot.CycleDelay);
		this.openMenu(npc) && this.shopItems(npc, menuId);

		return true;
	};

	// START
	for (let i = 0; i < Config.ShopBot.ScanIDs.length; i += 1) {
		if (isNaN(Config.ShopBot.ScanIDs[i])) {
			if (NTIPAliasClassID.hasOwnProperty(Config.ShopBot.ScanIDs[i].replace(/\s+/g, "").toLowerCase())) {
				Config.ShopBot.ScanIDs[i] = NTIPAliasClassID[Config.ShopBot.ScanIDs[i].replace(/\s+/g, "").toLowerCase()];
			} else {
				Misc.errorReport("ÿc1Invalid ShopBot entry:ÿc0 " + Config.ShopBot.ScanIDs[i]);
				Config.ShopBot.ScanIDs.splice(i, 1);
				i -= 1;
			}
		}
	}

	typeof Config.ShopBot.ShopNPC === "string" && (Config.ShopBot.ShopNPC = [Config.ShopBot.ShopNPC]);

	for (let i = 0; i < Config.ShopBot.ShopNPC.length; i += 1) {
		Config.ShopBot.ShopNPC[i] = Config.ShopBot.ShopNPC[i].toLowerCase();
	}

	if (Config.ShopBot.MinGold && me.gold < Config.ShopBot.MinGold) return true;

	this.buildPickList();
	print("Shopbot: Pickit entries: " + this.pickEntries.length);
	Town.doChores();

	tickCount = getTickCount();

	while (!Config.ShopBot.Cycles || totalCycles < Config.ShopBot.Cycles) {
		if (getTickCount() - tickCount >= 60 * 1000) {
			overlayText.cycles.text = "Cycles in last minute: " + cycles.toString();
			overlayText.totalCycles.text = "Total cycles: " + totalCycles.toString();
			cycles = 0;
			tickCount = getTickCount();
		}

		for (let i = 0; i < Config.ShopBot.ShopNPC.length; i += 1) {
			this.shopAtNPC(Config.ShopBot.ShopNPC[i]);
		}

		if (me.inTown) {
			let area = getArea(),
				wp = getPresetUnit(me.area, 2, [119, 156, 237, 398, 429][me.act - 1]),
				wpX = wp.roomx * 5 + wp.x,
				wpY = wp.roomy * 5 + wp.y,
				redPortal = (getUnits(2, 60).sort((a, b) => a.distance - b.distance)).first(),
				exit = area.exits[0];

			for (let i = 1; i < area.exits.length; i++) {
				if (getDistance(me, exit) > getDistance(me, area.exits[i])) {
					exit = area.exits[i];
				}
			}

			if (me.area === sdk.areas.Harrogath && !!redPortal && getDistance(me, redPortal) < 20
				&& Pather.usePortal(null, null, redPortal)) {
				delay(3000);
				Pather.usePortal(sdk.areas.Harrogath);

				if (totalCycles === 0) {
					delay(10000);
				}

				delay(1500);
			} else if (me.area === sdk.areas.RogueEncampment && !!redPortal && getDistance(me, redPortal) < 20
				&& Pather.usePortal(null, null, redPortal)) {
				delay(3000);
				Pather.usePortal(1);

				if (totalCycles === 0) {
					delay(10000);
				}

				delay(1500);
			} else if (getDistance(me, exit) < (getDistance(me, wpX, wpY) + 6)) {
				Pather.moveToExit(me.area + 1, true);
				Pather.moveToExit(me.area - 1, true);
			} else {
				Pather.useWaypoint([35, 48, 101, 107, 113][me.act - 1]);
			}
		}

		cycles += 1;
		totalCycles += 1;
	}

	return true;
}
