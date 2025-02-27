/**
*  @filename    UnitInfo.js
*  @author      kolton, theBGuy
*  @desc        Display unit info
*
*/
include("common/prototypes.js");

const UnitInfo = new function () {
	this.x = 200;
	this.y = 250;
	this.hooks = [];
	this.cleared = true;
	this.resfix = {x: (me.screensize ? 0 : -160), y: (me.screensize ? 0 : -120)};

	this.createInfo = function (unit) {
		if (typeof unit === "undefined") {
			this.remove();

			return;
		}

		switch (unit.type) {
		case 0:
			this.playerInfo(unit);

			break;
		case 1:
			this.monsterInfo(unit);

			break;
		case 2:
		case 5:
			this.objectInfo(unit);

			break;
		case 4:
			this.itemInfo(unit);

			break;
		}
	};

	this.playerInfo = function (unit) {
		let string,
			frameXsize = 0,
			frameYsize = 20,
			quality = ["ÿc0", "ÿc0", "ÿc0", "ÿc0", "ÿc3", "ÿc2", "ÿc9", "ÿc4", "ÿc8"];

		!this.currentGid && (this.currentGid = unit.gid);

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));

		let items = unit.getItemsEx();

		if (items.length) {
			this.hooks.push(new Text("Equipped items:", this.x, this.y + 15, 4, 13, 2));
			frameYsize += 15;

			for (let i = 0; i < items.length; i += 1) {
				if (items[i].getFlag(0x4000000)) {
					string = items[i].fname.split("\n")[1] + "ÿc0 " + items[i].fname.split("\n")[0];
				} else {
					string = quality[items[i].quality] + (items[i].quality > 4 && items[i].getFlag(0x10) ? items[i].fname.split("\n").reverse()[0].replace("ÿc4", "") : items[i].name);
				}

				this.hooks.push(new Text(string, this.x, this.y + (i + 2) * 15, 0, 13, 2));
				string.length > frameXsize && (frameXsize = string.length);
				frameYsize += 15;
			}
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, Math.round(frameXsize * 7.5) - 4, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, Math.round(frameXsize * 7.5), frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.monsterInfo = function (unit) {
		let frameYsize = 125;

		!this.currentGid && (this.currentGid = unit.gid);

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("HP percent: ÿc0" + Math.round(unit.hp * 100 / 128), this.x, this.y + 15, 4, 13, 2));
		this.hooks.push(new Text("Fire resist: ÿc0" + unit.getStat(39), this.x, this.y + 30, 4, 13, 2));
		this.hooks.push(new Text("Cold resist: ÿc0" + unit.getStat(43), this.x, this.y + 45, 4, 13, 2));
		this.hooks.push(new Text("Lightning resist: ÿc0" + unit.getStat(41), this.x, this.y + 60, 4, 13, 2));
		this.hooks.push(new Text("Poison resist: ÿc0" + unit.getStat(45), this.x, this.y + 75, 4, 13, 2));
		this.hooks.push(new Text("Physical resist: ÿc0" + unit.getStat(36), this.x, this.y + 90, 4, 13, 2));
		this.hooks.push(new Text("Magic resist: ÿc0" + unit.getStat(37), this.x, this.y + 105, 4, 13, 2));

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 136, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 140, frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.itemInfo = function (unit) {
		let xpos = 60,
			ypos = (me.getMerc() ? 80 : 20) + (-1 * this.resfix.y),
			frameYsize = 50;

		!this.currentGid && (this.currentGid = unit.gid);

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Code: ÿc0" + unit.code, xpos, ypos + 0, 4, 13, 2));
		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, xpos, ypos + 15, 4, 13, 2));
		this.hooks.push(new Text("Item Type: ÿc0" + unit.itemType, xpos, ypos + 30, 4, 13, 2));
		this.hooks.push(new Text("Item level: ÿc0" + unit.ilvl, xpos, ypos + 45, 4, 13, 2));

		this.cleared = false;
		this.socketedItems = unit.getItems();

		if (this.socketedItems) {
			this.hooks.push(new Text("Socketed with:", xpos, ypos + 60, 4, 13, 2));
			frameYsize += 30;

			for (let i = 0; i < this.socketedItems.length; i += 1) {
				this.hooks.push(new Text(this.socketedItems[i].fname.split("\n").reverse().join(" "), xpos, ypos + (i + 5) * 15, 0, 13, 2));

				frameYsize += 15;
			}
		}

		if (unit.quality === 4 && unit.getFlag(0x10)) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));
			this.hooks.push(new Text("Suffix: ÿc0" + unit.suffixnum, xpos, ypos + frameYsize + 10, 4, 13, 2));

			frameYsize += 30;
		}

		if (unit.getFlag(0x4000000)) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, xpos, ypos + frameYsize - 5, 4, 13, 2));

			frameYsize += 15;
		}

		this.hooks.push(new Box(xpos + 2, ypos - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(xpos, ypos - 15, 120, frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.objectInfo = function (unit) {
		let frameYsize = 35;

		!this.currentGid && (this.currentGid = unit.gid);

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Type: ÿc0" + unit.type, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y + 15, 4, 13, 2));

		if (!!unit.objtype) {
			this.hooks.push(new Text("Destination: ÿc0" + unit.objtype, this.x, this.y + 30, 4, 13, 2));

			frameYsize += 15;
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 120, frameYsize, 2));
		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.remove = function () {
		while (this.hooks.length > 0) {
			this.hooks.shift().remove();
		}

		this.cleared = true;
	};
};
