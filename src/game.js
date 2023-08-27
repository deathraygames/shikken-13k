const WORLD_SIZE = 1000;
const N = null;

const $ = (q) => document.querySelector(q);
const $id = (id) => document.getElementById(id);
const createSvg = (a) => document.createElementNS('http://www.w3.org/2000/svg', a);
const createAppendSvg = (a, p) => {
	const el = createSvg(a);
	p.appendChild(el);
	return el;
};
const setAttributes = (el, o) => Object.keys(o).forEach((k) => el.setAttribute(k, o[k]));

// From LittleJs
const rand = (a = 1, b = 0) => b + (a - b) * Math.random();
const randInt = (a = 1, b = 0) => rand(a, b)|0;

const resourceTypes = {

};

const buildingTypes = {
	// r = radius, cap = resource capacity, mm = max meeples
	connector: { r: 10, cap: 4, },
	tower: { r: 14, cap: 2, },
	farm: { r: 20, cap: 10 },
	barracks: { r: 20, cap: 2 },
	// ...
};

function getRandomWorldLocation() {
	return { x: randInt(WORLD_SIZE), y: randInt(WORLD_SIZE) };
}

function getRandomKey(prefix = 'U') {
	return [
		prefix,
		randInt(9999).toString(36),
		Number(new Date()).toString(36),
	].join('-');
}

function addRoad(bKey1, bKey2, rParam = {}) {
	const bKey1From = (bKey1 < bKey2);
	const r = {
		key: getRandomKey('R'),
		from: (bKey1From) ? bKey1 : bKey2,
		to: (bKey1From) ? bKey2 : bKey1,
		length: 0, // TODO
		...rParam,
	};
	if (g.roads[r.key]) throw new Error('Existing building');
	// TODO: search for existing road to/from and throw error if exists already
	g.roads[r.key] = r;
	g.roadKeys.push(r.key);
	return r;
}

function addBuilding(bParam = {}, fromBuildingKey = N) {
	const b = {
		key: getRandomKey('B'),
		type: 'connector',
		// x: 0,
		// y: 0,
		resources: [],
		// TODO: maintain links (roads) to other buildings so it is easy to find paths
		...getRandomWorldLocation(),
		...bParam,
	};
	if (g.buildings[b.key]) throw new Error('Existing building');
	console.log('Adding building', b);
	g.buildings[b.key] = b;
	g.buildingKeys.push(b.key);
	if (fromBuildingKey) {
		addRoad(b.key, fromBuildingKey);
	}
	return b;
}



function renderCanvas(ctx) {
	// ctx.fillStyle = 'green';
	// ctx.fillRect(10, 10, 150, 100);
}

function addBuildingSvg(b, layer) {
	const type = buildingTypes[b.type];
	console.log(b, type);
	const group = createAppendSvg('g', layer);
	group.id = b.key;
	const circle = createAppendSvg('circle', group);
	setAttributes(circle, {
		cx: b.x,
		cy: b.y,
		r: type.r,
		class: `building building-${b.type}`,
	});
	return group;
}

function addRoadSvg(r, layer) {
	const line = createAppendSvg('line', layer);
	line.id = r.key;
	const from = g.buildings[r.from];
	const to = g.buildings[r.to];
	setAttributes(line, {
		x1: from.x,
		y1: from.y,
		x2: to.x,
		y2: to.y,
		class: 'road',
	});
	return line;
}

function renderSvg(layers) {
	// TODO: render roads as lines
	g.buildingKeys.forEach((key) => {
		const b = g.buildings[key];
		let bEl = $id(key);
		if (!bEl) bEl = addBuildingSvg(b, layers.building);
	});
	g.roadKeys.forEach((key) => {
		const r = g.roads[key];
		let rEl = $id(key);
		if (!rEl) rEl = addRoadSvg(r, layers.road);
	});
}

function render() {
	const w = g.world;
	w.el.style.top = `${w.y}px`;
	w.el.style.left = `${w.x}px`;
	renderCanvas(w.ctx);
	renderSvg(w.layers);
}

function renderUi() {
	$('main').classList.toggle('bselected', g.selectedBuilding);
}

function tapWorld(e) {
	const t = e.target;
	const classes = t.classList;
	let binfo = '';
	if (classes.contains('building')) {
		const b = g.buildings[t.closest('g').id];
		console.log(t);
		if (!b) throw new Error(`Unknown building ${t.id}`);
		binfo = b.type;
		g.selectedBuilding = b;
	} else {
		g.selectedBuilding = N;
		if (classes.contains('road')) {
			binfo = 'road';
		}
	}
	$id('binfo').innerHTML = binfo;
	renderUi();
}

function tapTopUi(e) {
}

function tapBottomUi(e) {
	const t = e.target;
	console.log(t);
	if (t.closest('#play')) {
		console.log('play/pause');
	}
}

function setupEvents(w) {
	const { el } = w;
	let dragEvent;
	el.addEventListener('dragstart', (e) => {
		e.dataTransfer.setData('text/plain', 'w'); // this is required to be draggable
		e.dataTransfer.effectAllowed = 'move';
		// console.log('start', e);
		dragEvent = e;
	});
	el.addEventListener('drop', (e) => {
		// console.log('drop', e);
		w.x += e.clientX - dragEvent.clientX;
		w.y += e.clientY - dragEvent.clientY;
		render();
	});
	$('main').addEventListener('dragover', (e) => {
		e.preventDefault(); // this signifies that things can be dropped here
	});
	el.addEventListener('pointerdown', tapWorld);
	$id('bui').addEventListener('pointerdown', tapBottomUi);
	$id('tui').addEventListener('pointerdown', tapTopUi);
}

function start() {
	console.log('hello shikken');
	const c = $id('wc');
	const el = $id('w');
	g.world = {
		c,
		el,
		svg: $id('ws'),
		ctx: c.getContext('2d'),
		layers: {
			road: $id('layer-road'),
			building: $id('layer-building'),
			resource: $id('layer-resource'),
			meeple: $id('layer-meeple'),
		},
		x: 0,
		y: 0,
	};
	setupEvents(g.world);
	const b = addBuilding({ type: 'connector' });
	addBuilding({ type: 'connector' }, b.key);
	render(w);
}



const g = window.g = {
	state: 'game',
	world: {},
	buildings: {},
	buildingKeys: [],
	freeMeeples: {},
	roads: {},
	roadKeys: [],
	selectedBuilding: N,
	start,
};
document.addEventListener('DOMContentLoaded', g.start);
