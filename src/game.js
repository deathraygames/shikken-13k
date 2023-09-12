// import { ZZFX } from '../node_modules/zzfx/ZzFX.js';
import Vector2 from './Vector2.js';

// const WORLD_SIZE = 2000;
// Resources
const Gr = 'grain',
	Ri = 'rice',
	Ka = 'karma',
	S = 'stone',
	Or = 'ore',
	W = 'wood';
const T = true;
const F = false;
const N = null;
const TWO_PI = Math.PI * 2;
// Speed in pixels per millisecond
const MEEP_SPEED = 120 * (1/1000); // pixels per second * s/ms
const PROD_SPEED = MEEP_SPEED;
const CARR_SPEED = MEEP_SPEED * 1.1;
const ENCUMBER = 0.6; // multipler to speed
const IDLE_SPEED = MEEP_SPEED * 0.25;
const WORK_SPEED = MEEP_SPEED * 0.75;
const MAX_PATH_LOOK = 20;
const MAX_WORKERS = 6;
const WIND_KARMA = 300;
const KARMA_PER_RESOURCE = 1;
const MEEPLE_SIZE = 9; // radius
const BUILDING_BASE_SIZE = MEEPLE_SIZE + 5;
const BASE_DEF = 0.5;
const DEF_DEF = 0.9;
const COUNTDOWN = 4 * 60 * 1000; // 600000; // 10 minutes * 60 seconds/min * 1000 ms/sec
const INITIAL_COUNTDOWN = 5 * 60 * 1000;
const WIDTH_MULT = 2;
const INVADER_PATH_RANGE = MEEPLE_SIZE * 20;
const DEFENDER_PATH_RANGE = MEEPLE_SIZE * 10;
const MELEE_DIST = MEEPLE_SIZE * 1.5; // want to allow a little overlap
const DMG = 20;
const HP = 100;
const HEAL = 5 / 1000; // 1 per 1000 ms

const $ = (q) => document.querySelector(q);
const $id = (id) => document.getElementById(id);
const on = (el, type, fn) => el.addEventListener(type, fn);
const createSvg = (a) => document.createElementNS('http://www.w3.org/2000/svg', a);
const createAppendSvg = (a, p) => {
	const el = createSvg(a);
	p.appendChild(el);
	return el;
};
const setAttr = (el, o) => {
	Object.keys(o).forEach((k) => {
		el.setAttribute(k, o[k])
	});
};
const setInputAttr = (el, propName, val) => {
	el.setAttribute(propName, val);
	el[propName] = val;
};
const setHtml = (sel, html) => {
	const el = (typeof sel === 'object') ? sel : $(sel);
	if (!el) throw new Error(`Cannot find element ${sel}`);
	// if (sel === '#binfo') console.log(el.innerHTML, el.innerHTML.length, '\n...compare to...\n', html, html.length);
	if (el.innerHTML === html) return false;
	el.innerHTML = html;
	return true;
};
const translateStyle = (v) => `translate(${v.x}px, ${v.y}px)`;

// From LittleJs
const rand = (a = 1, b = 0) => b + (a - b) * Math.random();
const randInt = (a = 1, b = 0) => rand(a, b)|0;
const randSign = () => (rand(2)|0) * 2 - 1;
// const distanceSquared = ({x,y}, {x1,y1}) => (x - x1)**2 + (y - y1)**2;
// const distance = (v1, v2) => distanceSquared(v1, v2)**.5;
const vec2 = (x=0, y)=> x.x == undefined ? new Vector2(x, y == undefined? x : y) : new Vector2(x.x, x.y);
// Other mini helpers
const randPick = (arr) => arr[randInt(arr.length)];
const atPoint = (v1, v2, within = 2) => (vec2(v1).distance(v2) <= within);
const setVec = (o, v) => { o.x = v.x; o.y = v.y; return o; }

const resourceTypes = Object.freeze({
	grain: { shape: 'polygon', sides: 3, r: 6, offsetAngle: (1/6) * TWO_PI },
	rice: { shape: 'polygon', sides: 5, r: 6 },
	wood: { shape: 'polygon', sides: 4, r: 6, offsetAngle: (1/8) * TWO_PI },
	stone: { shape: 'polygon', sides: 4, r: 6 },
	ore: { shape: 'polygon', sides: 3, r: 6 },
});
const JOBS = [
	{ key: 'idle', name: 'Wanderer', altName: 'Idle', classification: '💤' },
	{ key: 'prod', name: 'Farmer/Artisan', altName: 'Production', classification: '🪚' },
	{ key: 'carr', name: 'Carrier/Merchant', altName: 'Transportation', classification: '🧺' },
	{ key: 'defe', name: 'Samurai/Soldier', altName: 'Defenders', classification: '🛡️' },
	{ key: 'spir', name: 'Monk/Pilgrim', altName: 'Spiritualist', classification: '🪷' },
];
const JOBS_OBJ = JOBS.reduce((o, jobObj) => { o[jobObj.key] = jobObj; return o; }, {});
const JOB_KEYS = Object.keys(JOBS_OBJ);
const baseType = {
	name: '',
	r: 10, // radius and computes max resources
	cap: 0, // inventory capacity
	cost: [], // cost to create/upgrade
	upgrades: [], // upgrade paths from here
	defMax: 0, // contribution to defense max meeples
	popMax: 0, // contribution to max meeples
	input: [], // input for production
	output: [], // output of production
	rate: 0, // rate of production: # of outputs per minute
	autoWork: F, // does this building work without workers?
	classification: '', // production, defense, spirit
};
const buildingTypesArr = [
	{
		key: 'outpost',
		name: 'Outpost',
		r: BUILDING_BASE_SIZE + 10, cap: 6, cost: [W, W, S, S],
		defMax: 2, popMax: 2,
		classification: '🚩'
	},
	{
		key: 'connector',
		name: 'Crossroad',
		r: BUILDING_BASE_SIZE, cap: 2, cost: [],
		upgrades: ['shrine', 'tower', 'stockpile', 'stoneMine', 'farmHouse', 'woodCutter', 'grainFarm', ],
		classification: '🪧'
	},
	{
		key: 'stockpile',
		name: 'Stockpile',
		r: BUILDING_BASE_SIZE + 20, cap: 20, cost: [S, W, Gr],
		upgrades: ['warehouse'],
		classification: '📦',
	},
	{
		key: 'warehouse',
		name: 'Warehouse',
		r: BUILDING_BASE_SIZE + 32, cap: 40, cost: [S, S],
		classification: '📦',
	},
	{
		key: 'woodCutter',
		name: 'Woodcutter',
		r: BUILDING_BASE_SIZE + 10, cap: 6, cost: [Gr],
		input: [Gr], output: [W], rate: 4,
		classification: '🪚',
	},
	{
		key: 'stoneMine',
		name: 'Stone Mine',
		r: BUILDING_BASE_SIZE + 10, cap: 6, cost: [W, W, W, Gr],
		input: [Gr], output: [S], rate: 1.5,
		upgrades: ['oreMine'],
		classification: '🪚',
	},
	{
		key: 'oreMine',
		name: 'Ore Mine',
		r: BUILDING_BASE_SIZE + 20, cap: 6, cost: [W, S, Gr],
		input: [W, Gr], output: [Or], rate: 1,
		classification: '🪚',
	},
	{
		key: 'tower',
		name: 'Watchtower',
		r: BUILDING_BASE_SIZE + 4, cap: 2, cost: [S, W, W],
		defMax: 3,
		upgrades: ['fortress'],
		classification: '🛡️',
	},
	{
		key: 'fortress',
		name: 'Fortress',
		r: BUILDING_BASE_SIZE + 14, cap: 4, cost: [S, S, S, W, Or],
		defMax: 6,
		classification: '🛡️',
	},
	{
		key: 'grainFarm',
		name: 'Grain farm',
		r: BUILDING_BASE_SIZE + 10, cap: 8, cost: [W, W],
		input: [], output: [Gr], rate: 3,
		upgrades: ['riceFarm'],
		classification: '🪚',
	},
	{
		key: 'riceFarm',
		name: 'Rice farm',
		r: BUILDING_BASE_SIZE + 14, cap: 6, cost: [W, W, Or, Or],
		input: [], output: [Ri], rate: 4,
		classification: '🪚',
	},
	{
		key: 'shrine',
		name: 'Shrine',
		r: BUILDING_BASE_SIZE + 6, cap: 6, cost: [W, S, Or],
		input: [Ri], output: [Ka], rate: 3,
		upgrades: ['temple'],
		classification: '🪷',
	},
	{
		key: 'temple',
		name: 'Temple',
		r: BUILDING_BASE_SIZE + 22, cap: 6, cost: [S, Or, Or, Ri],
		input: [Ri], output: [Ka, Ka], rate: 4,
		classification: '🪷',
	},
	{ // noka
		key: 'farmHouse',
		name: 'Noka (farmhouse)',
		r: 20, cap: 2, cost: [W, W, W],
		input: [Gr], output: ['meeple'], rate: 1,
		popMax: 3,
		upgrades: ['urbanHouse'],
		autoWork: T,
		classification: '🛖',
	},
	{ // machiya
		key: 'urbanHouse',
		name: 'Machiya (urban house)',
		r: 30, cap: 4, cost: [W, W, Or, Ri, Ri],
		input: [Ri], output: ['meeple'], rate: 1,
		popMax: 8,
		autoWork: true,
		classification: '🛖',
	},
];
const buildingTypes = buildingTypesArr.reduce((obj, bt) => {
	obj[bt.key] = {
		...baseType,
		...bt,
	};
	return obj;
}, {});

function getRandomWorldLocation() {
	return { x: randInt(g.world.width / 2), y: randInt(g.world.height) };
}

function getRandomKey(prefix = 'U') {
	return [
		prefix,
		randInt(9999).toString(36),
		Number(new Date()).toString(36),
	].join('-');
}

/* ------------------------------ Looping ------------------ */

function loopThing(keys, obj, fn) {
	return keys.map((key, i) => {
		const o = obj[key];
		return fn(o, key, i);
	});
}

const loopBuildings = (fn) => loopThing(g.buildingKeys, g.buildings, fn);
const loopRoads = (fn) => loopThing(g.roadKeys, g.roads, fn);
const loopCitizens = (fn) => loopThing(g.citizenKeys, g.meeples, fn);
const loopInvaders = (fn) => loopThing(g.invaderKeys, g.meeples, fn);

/* ------------------------------ Adding ------------------ */

function getPopMax() {
	return 1 + g.buildingKeys.reduce((sum, k) => sum + (buildingTypes[g.buildings[k].type].popMax || 0), 0);
}

function getDefenderMax() {
	return g.buildingKeys.reduce((sum, k) => sum + (buildingTypes[g.buildings[k].type].defMax || 0), 0);
}

function addRoad(bKey1, bKey2, rParam = {}) {
	const bKey1From = (bKey1 < bKey2);
	const r = {
		key: getRandomKey('R'),
		from: (bKey1From) ? bKey1 : bKey2,
		to: (bKey1From) ? bKey2 : bKey1,
		// length: 0,
		...rParam,
	};
	if (g.roads[r.key]) throw new Error('Existing building');
	// TODO: search for existing road to/from and throw error if exists already
	g.roads[r.key] = r;
	g.roadKeys.push(r.key);
	return r;
}

function resetProductionCooldown(b, extra = 0) {
	const { rate } = buildingTypes[b.type];
	if (!rate) {
		b.prodCool = 0;
		return;
	}
	const extraNum = (Number.isNaN(extra)) ? 0 : extra;
	b.prodHeat = (
		60000 // 60000 ms per 1 minute
		* (1 / rate) // rate = # of things created in 1 minute
	) + extraNum;
	if (g.godMode) b.prodHeat = 1;
	b.prodCool = b.prodHeat;
}

function addBuilding(bParam = {}, fromBuildingKey = N) {
	const b = {
		key: getRandomKey('B'),
		type: 'connector',
		// x: 0,
		// y: 0,
		supplied: F,
		prodCool: 0,
		prodHeat: 0,
		on: true,
		inv: [],
		refresh: false, // remove rendered element and recreate
		// TODO: maintain links (roads) to other buildings so it is easy to find paths
		...getRandomWorldLocation(),
		...bParam,
	};
	resetProductionCooldown(b);
	if (g.buildings[b.key]) throw new Error('Existing building');
	console.log('Adding building', b);
	g.buildings[b.key] = b;
	g.buildingKeys.push(b.key);
	if (fromBuildingKey) {
		addRoad(b.key, fromBuildingKey);
	}
	return b;
}

function makeMeepleObject(m = {}) {
	return {
		key: getRandomKey('M'),
		job: 'idle',
		faction: 'japan',
		hp: HP,
		defense: BASE_DEF,
		carry: N,
		weapon: N,
		buildingKey: N, // goal
		path: [],
		inv: [],
		// x: 0,
		// y: 0,
		...getRandomWorldLocation(),
		...m,
	};
}

function addMeeple(mParam = {}, keyArr) {
	const m = makeMeepleObject(mParam);
	if (g.meeples[m.key]) throw new Error('Existing meeple');
	console.log('Adding meeple', m);
	g.meeples[m.key] = m;
	keyArr.push(m.key);
	return m;
}

function addCitizen(mParam = {}) {
	if (g.citizenKeys.length >= getPopMax()) {
		// console.warn('Could not add another meeple');
		return false;
	}
	return addMeeple(mParam, g.citizenKeys);
}

function addInvader(mParam) {
	return addMeeple({
		key: getRandomKey('I'),
		job: 'kill',
		faction: 'mongol',
		hp: HP,
		defense: 0.2,
		x: 0,
		...mParam,
	}, g.invaderKeys);
}

/* ------------------------------ Jobs ------------------ */

function getBlankJobCounts() {
	return JOB_KEYS.reduce((o, j) => ({ ...o, [j]: 0 }), {});
}

function getJobCounts() {
	return g.citizenKeys.reduce((counts, key) => {
		const m = g.meeples[key];
		counts[m.job] = (counts[m.job] || 0) + 1;
		return counts;
	}, getBlankJobCounts());
}

function getAdjustedJobCounts(job, val) {
	const currJobCounts = getJobCounts();
	const desiredJobCounts = {
		...currJobCounts,
		[job]: val,
	};
	const diff = desiredJobCounts[job] - currJobCounts[job];
	if (diff <= 0) {
		// If we're removing jobs, it's easy - we just make them idle
		desiredJobCounts.idle += diff * -1;
		return desiredJobCounts;
	}
	// Otherwise we're assigning jobs so we need to find the counts
	let left = diff;
	if (job !== 'idle') {
		const takeFromIdle = Math.min(currJobCounts.idle, diff);
		left -= takeFromIdle;
		desiredJobCounts.idle -= takeFromIdle;
	}
	if (left <= 0) return desiredJobCounts;
	const leftJobs = JOB_KEYS.reduce((arr, j) => {
		if (j !== job && j !== 'idle') arr.push(j);
		return arr;
	}, []);
	leftJobs.forEach((j, i) => {
		const leftJobCount = (leftJobs.length - i) || 1;
		const remove = Math.min(
			Math.ceil(left / leftJobCount),
			currJobCounts[j],
		);
		left -= remove;
		desiredJobCounts[j] -= remove;
	});
	return desiredJobCounts;
}

function assignJobs(desiredJobCounts = {}) {
	const currJobCounts = getBlankJobCounts();
	const stillNeedJob = (j) => ((currJobCounts[j] || 0) < desiredJobCounts[j]);
	const incrementJob = (j) => currJobCounts[j] = (currJobCounts[j] || 0) + 1;
	loopCitizens((m) => {
		// Still need this job, so keep job and increment count
		if (stillNeedJob(m.job)) {
			incrementJob(m.job);
			return;
		}
		// Give the meeple a new job
		m.job = JOB_KEYS.find(stillNeedJob) || 'idle';
		m.path = []; // (m.path.length) ? [m.path[0]] : [];
		incrementJob(m.job);
	});
	JOB_KEYS.forEach((job) => {
		if (job === 'idle') return;
	});
	// console.log('Meeples assigned jobs:', g.meeples, 'desired:', desiredJobCounts, 'final:', currJobCounts);
}

/* ------------------------------ Upgrading ------------------ */

function payBuildingCost(bUpgrading, cost = []) {
	const afford = canAffordAllResources(cost);
	if (!afford) return F;
	let leftToPay = [...cost];
	leftToPay = consumeResources(bUpgrading, leftToPay);
	// TODO: Loop through buildings based on connections or prioritizing stockpiles
	loopBuildings((b) => {
		leftToPay = consumeResources(b, leftToPay);
	});
	loopCitizens((m) => {
		leftToPay = consumeResources(m, leftToPay);
	});
	return T;
}

function upgradeBuilding(bKey, upTypeKey) {
	const b = g.buildings[bKey];
	const { upgrades = [] } = buildingTypes[b.type]
	if (!upgrades.includes(upTypeKey)) throw new Error(`Unknown upTypeKey`);
	const paid = payBuildingCost(b, buildingTypes[upTypeKey].cost);
	if (!paid) {
		// window.alert('Cannot afford this upgrade yet.');
		return;
	}
	b.type = upTypeKey;
	b.refresh = T;
	resetProductionCooldown(b);
	renderBuildings();
}

/* ------------------------------ Rendering ------------------ */

function renderCanvas(ctx) {
	// ctx.fillStyle = 'green';
	// ctx.fillRect(10, 10, 150, 100);
}

function setCirclePercent(circleSvgEl, r, percent = 0) {
	if (!circleSvgEl) throw new Error('No circle element');
	const circumference = r * (2 * Math.PI);
	const circPercent = percent * circumference;
	const dashArray = [circPercent, circumference - circPercent];
	setAttr(circleSvgEl, {
		r,
		// stroke: 'tomato',
		'stroke-width': '10',
		'stroke-dasharray': dashArray.join(' '),
		'stroke-dashoffset': 40, // ?? just picked something that looks okay
		// fill: 'none',
	});
}

function setBuildingProgressSvg(b) {
	const type = buildingTypes[b.type];
	const r = type.r + 4;
	const percent = getProdPercent(b);
	const bEl = $id(b.key);
	setCirclePercent(bEl.querySelector('.b-prod-circle'), r, percent);
}

function addBuildingSvg(b, layer) {
	const type = buildingTypes[b.type];
	const group = createAppendSvg('g', layer);
	// group.id = b.key;
	setAttr(group, {
		id: b.key,
		style: `transform: ${translateStyle(b)}`,
	});
	const prodCircle = createAppendSvg('circle', group);
	setAttr(prodCircle, {
		// r: type.r + 4,
		'class': `b-prod-circle b-prod-${b.type}`,
	});
	setBuildingProgressSvg(b);
	const circle = createAppendSvg('circle', group);
	setAttr(circle, {
		// cx: b.x,
		// cy: b.y,
		r: type.r,
		'class': `building b-${b.type}`,
	});
	const resourceGroup = createAppendSvg('g', group);
	setAttr(resourceGroup, { 'class': 'b-res-g res-g' });
	return group;
}

function addRoadSvg(r, layer) {
	const line = createAppendSvg('line', layer);
	line.id = r.key;
	const from = g.buildings[r.from];
	const to = g.buildings[r.to];
	setAttr(line, {
		x1: from.x,
		y1: from.y,
		x2: to.x,
		y2: to.y,
		'class': 'road',
	});
	return line;
}

function addMeepleSvg(m, layer) {
	const group = createAppendSvg('g', layer);
	setAttr(group, {
		id: m.key,
		style: `transform: ${translateStyle(m)}`,
		'class': 'meeple-g',
	});
	const circle = createAppendSvg('circle', group);
	// circle.id = m.key;
	setAttr(circle, {
		// cx: 0, // m.x,
		// cy: 0, // m.y,
		r: MEEPLE_SIZE,
		'class': `meeple mj-${m.job}`,
	});
	const resourceGroup = createAppendSvg('g', group);
	setAttr(resourceGroup, { 'class': 'm-res-g res-g' });
	return group;
}

function getPolygonPoints(sides, r, offsetAngle = 0) {
	const points = [];
	for (let i = 0; i < sides; i += 1) {
		const a = offsetAngle + ((i / sides) * TWO_PI);
		const v = vec2().setAngle(a, r);
		const { x, y } = v
		points.push([ x, y ].map((n) => Math.round(n * 100) / 100));
	}
	return points;
}

function addResourceSvg(res, layer) {
	const { shape, sides, r, offsetAngle = 0 } = resourceTypes[res];
	const shapeEl = createAppendSvg(shape, layer);
	const points = getPolygonPoints(sides, r, offsetAngle)
		.map((pointsArr) => pointsArr.join(','))
		.join(' ');
	setAttr(shapeEl, {
		points,
		r,
		'class': `res res-${res}`,
		'data-res': res,
	});
	return shapeEl;
}

function renderResources(inv, gEl, r = 10) {
	const children = [...gEl.children];
	const expected = [...inv];
	children.forEach((el) => {
		const { res } = el.dataset;
		if (!res) {
			el.remove();
			return;
		}
		const i = expected.indexOf(res);
		if (i === -1) { // Not expected (anymore)
			el.remove();
			return;
		}
		// This resource is expected, so keep the element, but remove from expected list
		expected.splice(i, 1);
	});
	expected.forEach((res) => {
		const shape = addResourceSvg(res, gEl);
		const v = vec2(0, 0).setAngle(rand(Math.PI * 2), rand(r));
		// shape.style.cx = randInt(6) * randSign();
		// shape.style.cy = randInt(6) * randSign();
		shape.style.cx = v.x;
		shape.style.cy = v.y;
		shape.style.transform = translateStyle(v);
	});
}

function renderBuildings() {
	const { layers } = g.world;
	loopBuildings((b) => {
		const bt = buildingTypes[b.type];
		let bEl = $id(b.key);
		if (bEl && b.refresh) {
			bEl.remove();
			bEl = N;
			b.refresh = F;
		}
		if (!bEl) bEl = addBuildingSvg(b, layers.building);
		bEl.classList.toggle('closed', !b.on);
		bEl.classList.toggle('selectedb', (b.key === g.selectedBuildingKey));
		setBuildingProgressSvg(b);
		renderResources(b.inv, bEl.querySelector('.res-g'), bt.r);
	});
}

function renderMeeple(m, layer) {
	let mEl = $id(m.key);
	if (!mEl) mEl = addMeepleSvg(m, layer);
	const circle = mEl.querySelector('.meeple');
	setAttr(circle, { 'class': `meeple mj-${m.job}` });
	mEl.classList.toggle('hurt', m.hp < HP);
	mEl.style.transform = translateStyle(m);
	renderResources(m.inv, mEl.querySelector('.res-g'), MEEPLE_SIZE);
}

function renderSvg(layers) {
	renderBuildings();
	loopRoads((r) => {
		let rEl = $id(r.key);
		if (!rEl) rEl = addRoadSvg(r, layers.road);
	});
	loopCitizens((m) => renderMeeple(m, layers.meeple));
	loopInvaders((m) => renderMeeple(m, layers.meeple));
}

function loopJobs(fn) {
	JOB_KEYS.forEach((job) => {
		const el = $(`#jr-${job}`);
		const input = el.querySelector('input[type="range"]');
		const numEl = el.querySelector('.jr-num');
		fn(job, input, el, numEl);
	});
}

function renderJobAssignment() {
	if (!g.assigning) return;
	const counts = getJobCounts();
	const maxMeeples = g.citizenKeys.length;
	const maxDefenders = Math.min(maxMeeples, getDefenderMax());
	loopJobs((job, input, el, numEl) => {
		const n = counts[job];
		numEl.innerText = n;
		const max = (job === 'defe') ? maxDefenders : maxMeeples;
		if (input.max !== max) setInputAttr(input, 'max', max);
		if (input.value !== n) setInputAttr(input, 'value', n);
	});
}

function getBuildingInfoHtml(b) {
	if (!b) return '';
	const bt = buildingTypes[b.type];
	// const upgradeButton = `<button id="b-up-toggle"><i>👁️🛠️</i><b>Toggle Upgrades (${bt.upgrades.length})</b></button>`;
	// ${bt.upgrades.length ? upgradeButton : ''}
	const toggleButtons = `<div class="switch">
		<button ${(b.on) ? 'disabled="disabled"' : ' id="b-on"'}><i>🕯️</i><b>On</b></button>
		<button ${(b.on) ? 'id="b-off"' : 'disabled="disabled"'}><i>🚫</i><b>Off</b></button>
	</div>`;
	const prod = `<div>🪚 Production:
			<span class="prodin ${b.supplied ? 'supplied' : 'missing'}">
				${(bt.input.length) ? bt.input.join(', ') : '(No input)'}
			</span>
			➡️ ${(bt.output.length) ? bt.output.join(', ') : '(No output)'}
			<span>(${bt.rate}/min)</span>
			<span id="b-progress">%</span>
		</div>`;
	return `<div>
			<div class="b-name">${bt.classification} ${bt.name || b.type}</div>
			<div>📦 Resources: ${b.inv.join(', ')} (${b.inv.length} / max: ${bt.cap})</div>
			${isBuildingProducer(b) ? prod : ''}
			${bt.popMax ? `<div>+${bt.popMax} max citizens</div>` : ''}
			${bt.defMax ? `<div>+${bt.defMax} max defenders</div>` : ''}
		</div>
		<div>
			${toggleButtons}
		</div>`;
}

function renderBuildingInfo(b) {
	if (!b) return;
	const binfo = getBuildingInfoHtml(b);
	setHtml('#binfo', binfo);
	if (isBuildingProducer(b)) {
		const percent = Math.floor(getProdPercent(b) * 100);
		setHtml('#b-progress', (isBuildingProducing(b)) ? `${percent}%` : '');
	}
}

function renderMeepleCounts() {
	const html = `${g.citizenKeys.length} / max: ${getPopMax()}, Defenders max: ${getDefenderMax()}`;
	setHtml('#mcounts', html);
}

function renderUi() {
	const classes = $('main').classList;
	classes.toggle('bselected', g.selectedBuildingKey);
	classes.toggle('looping', g.looping);
	classes.toggle('creating', g.creating);
	classes.toggle('moving', g.moving);
	classes.toggle('assigning', g.assigning);
	classes.toggle('pop', g.citizenKeys.length > 0);
	classes.toggle('intro', g.state === 'intro');
	classes.toggle('game', g.state === 'game');
	classes.toggle('flash', g.flashMessage);
	// Update countdown
	if (!g.countdownEl) g.countdownEl = $id('cd');
	let cd = g.countdown;
	const mins = Math.floor(cd * (1/1000) * (1/60));
	cd -= (mins * 1000 * 60);
	const sec = Math.floor(cd * (1/1000));
	setHtml(g.countdownEl, `${g.peace ? '☮️' : '⚔️'} ${mins}:${sec < 10 ? '0' : ''}${sec}`);
	setHtml('#karma', (g.karma) ? `🪷 Karma: ${g.karma} /${WIND_KARMA}` : '');
	$('#kamikaze').style.display = (g.karma >= WIND_KARMA) ? 'block' : 'none';
	// List
	if (g.selectedBuildingKey) {
		const b = g.buildings[g.selectedBuildingKey];
		renderBuildingInfo(b);
		const { upgrades } = buildingTypes[b.type];
		let upgradesHtml = (upgrades.length)
			? upgrades.map((key) => {
				const { name = key, cost, classification } = buildingTypes[key];
				const afford = canAffordAllResources(cost);
				return `<li class="up-action ${(!afford) ? 'unaffordable' : 'affordable'}" data-upgrade="${key}" data-building="${g.selectedBuildingKey}">
					<span class="up-name">${classification} ${name}</span>
					<span class="up-cost">${cost}</span>
				</li>`
			}).join('')
			: 'No upgrades';
		setHtml('#blist', (g.upgradesOpen) ? upgradesHtml : '');
	}
	renderMeepleCounts();
}

function render() {
	const w = g.world;
	w.el.style.top = `${w.y}px`;
	w.el.style.left = `${w.x}px`;
	const width = g.world.width * g.zoom;
	const height = g.world.height * g.zoom;
	w.el.style.width = `${width}px`;
	w.el.style.height = `${height}px`;
	renderCanvas(w.ctx);
	renderSvg(w.layers);
	renderUi();
}

function showFlashMessage(title, text, emoji) {
	g.flashMessage = { title, text, emoji };
	setHtml('#flash i', emoji);
	setHtml('#flash h1', title);
	setHtml('#flash p', text);
	render();
	stopLoop();
}

/* ------------------------------ Querying World ------------------ */

function sumInv(inv) {
	return inv.reduce((o, res) => ({ ...o, [res]: (o[res] || 0) + 1 }), {});
}

function getAllResourceCounts() {
	const counts = {};
	const sumInv = (w) => {
		w.inv.forEach((res) => {
			counts[res] = (counts[res] || 0) + 1;
		});
	};
	loopBuildings(sumInv);
	loopCitizens(sumInv)
	return counts;
}

function getNeededAllResources(costArr = []) {
	const all = getAllResourceCounts();
	const cost = sumInv(costArr);
	const need = {};
	Object.keys(cost).forEach((res) => {
		need[res] = cost[res] - (all[res] || 0);
		if (need[res] < 0) need[res] = 0;
	});
	return need;
}

function canAffordAllResources(costArr = []) {
	const need = getNeededAllResources(costArr);
	const needSum = Object.keys(need).reduce((sum, res) => (sum + need[res]), 0);
	return (needSum <= 0);
}

function filterBuildingKeys(fn) {
	return g.buildingKeys.filter((key) => {
		const b = g.buildings[key];
		const bt = buildingTypes[b.type];
		return fn(b, bt);
	});
}

function getNearestBuilding(spot) {
	let closest = Infinity;
	let closestB = null;
	loopBuildings((b) => {
		const dist = vec2(b).distance(spot);
		if (dist >= closest) return;
		closest = dist;
		closestB = b;
	});
	return closestB;
}

function isOnBuilding(spot, b) {
	const bType = buildingTypes[b.type];
	const dist = vec2(b).distance(spot);
	return (dist <= bType.r);
}

function getBuildingOn(spot) {
	const b = getNearestBuilding(spot);
	if (!b) return null;
	const bType = buildingTypes[b.type];
	const dist = vec2(b).distance(spot);
	return (dist > bType.r) ? null : b;
}

// function getRoadsConnected(b) {
// 	return g.roadKeys.filter((r) => (r.from === b.key || r.to === b.key));
// }

function getBuildingsConnected(bKey) {
	return g.roadKeys.reduce((arr, rKey) => {
		const r = g.roads[rKey];
		if (r.from === bKey) arr.push(r.to);
		else if (r.to === bKey) arr.push(r.from);
		return arr;
	}, []);
}

function getPathBetween(pathParam = [], destKey) {
	const fullPath = (typeof pathParam === 'string') ? [pathParam] : [...pathParam];
	// console.log(fullPath);
	if (fullPath.length >= MAX_PATH_LOOK) return fullPath;
	if (fullPath.includes(destKey)) return fullPath;
	const last = fullPath[fullPath.length - 1];
	const bKeys = getBuildingsConnected(last);
	// Are we connected to the destination?
	if (bKeys.includes(destKey)) return fullPath.concat(destKey);
	// We haven't reached the end (destKey) yet, so keep looking
	let bestPathSize = Infinity;
	let bestPath = null;
	const childrenPaths = bKeys.map((bKey) => {
		let childPath = [...fullPath];
		// If the path already has this key, then stop
		if (fullPath.includes(bKey)) return childPath;
		// Otherwise let's look further
		childPath.push(bKey);
		// TODO LATER: Pass best path size so that we don't look further down another child
		// if we don't have to
		childPath = getPathBetween(childPath, destKey);
		if (childPath.includes(destKey) && childPath.length <= bestPathSize) {
			bestPath = childPath;
			bestPathSize = childPath.length;
		}
		return childPath;
	});
	// If no best then just pick something random
	if (bestPath === null) return childrenPaths[0];
	return bestPath;
}

function getPathToBuilding(b, from) {
	const nearestB = getNearestBuilding(from);
	if (!nearestB) return [];
	const buildingPath = getPathBetween([nearestB.key], b.key);
	const path = buildingPath.map((key) => {
		const b = g.buildings[key];
		return { key, x: b.x, y: b.y };
	});
	return path;
}

function isBuildingProducer(b) {
	const bt = buildingTypes[b.type];
	return ((bt.input && bt.input.length) || (bt.output && bt.output.length));
}

function isBuildingProducing(b) {
	return (isBuildingProducer(b) && b.on
		// TODO LATER: Also check if it is clogged up
	);
}

function isMeepleWorkingAt(m, bParam) {
	const b = getBuildingOn(m);
	if (!b) return false;
	if (bParam && bParam.key !== b.key) return false;
	// TODO: check if the building needs this worker
	const bProd = isBuildingProducing(b);
	const bt = buildingTypes[b.type];
	return (
		bProd
		&& (
			(m.job === 'prod' && bt.classification === '🪚')
			|| (m.job === 'spir' && bt.classification === '🪷')
		)
	);
}

function countWorkers(b) {
	return g.citizenKeys.reduce((sum, key) => (
		sum + (isMeepleWorkingAt(g.meeples[key], b) ? 1 : 0)
	), 0);
}

/** Does an inventory have a list of resources? */
function doesInvHave(inv, arr = []) {
	const leftOver = inv.reduce((left, res) => {
		const i = left.indexOf(res);
		if (i >= 0) left.splice(i, 1);
		return left;
	}, [...arr]);
	return (leftOver.length === 0);
}

function getProdPercent(b) {
	if (b.prodHeat === 0) return 0;
	return (1 - (b.prodCool / b.prodHeat));
}

function getUnneededResources(b) {
	if (!b.on) return [...b.inv]; // If off, then all is unneeded
	const bt = buildingTypes[b.type];
	const wanted = [...bt.input];
	const unneeded = b.inv.reduce((left, res) => {
		const i = wanted.indexOf(res);
		if (i > 0) {
			wanted.splice(i, 1);
		} else {
			left.push(res);
		}
		return left;
	}, []);
	return unneeded;
}

function hasUnneededResources(b) {
	const unneeded = getUnneededResources(b);
	return (unneeded && unneeded.length);
}

function needsResource(b, res) {
	if (!b.on) return F;
	const bt = buildingTypes[b.type];
	const resSum = (sum, r) => sum + ((r === res) ? 1 : 0); // resource summation fn
	const need = bt.input.reduce(resSum, 0);
	const has = b.inv.reduce(resSum, 0);
	return (need > has);
}

function isFull(b) {
	return (b.inv.length >= buildingTypes[b.type].cap);
}

/** Remove resources from arr from inventory and return what's left to remove */
function removeInvResources(inv, arr = []) {
	if (!arr.length) return [];
	const left = [...arr]; // What's left to remove
	// Loop over resources backwards because we'll be removing items, altering indices
	for (let w = inv.length; w--; w >= 0) {
		const res = inv[w];
		const i = left.indexOf(res); // If this one that's left to remove
		if (i >= 0) {
			left.splice(i, 1);
			inv.splice(w, 1);
		}
	}
	return left;
}

function getNearestMeeple(spot, keys = []) {
	let distance = Infinity;
	let nearest = null;
	const v = vec2(spot);
	keys.forEach((key) => {
		const m = g.meeples[key];
		const diff = v.distance(m);
		if (diff >= distance) return;
		distance = diff;
		nearest = m;
	});
	return { nearest, distance };
}

/* ------------------------------ Looping ------------------ */

function destroyMeeple(m) { // aka kill
	const c = g.citizenKeys.indexOf(m.key);
	if (c !== -1) g.citizenKeys.splice(c, 1);
	const i = g.invaderKeys.indexOf(m.key);
	if (i !== -1) g.invaderKeys.splice(i, 1);
	delete g.meeples[m.key];
	// Remove element (TODO - move to render)
	$id(m.key).remove();
}

function damage(m, n) {
	const half = n / 2;
	m.hp -= (n + randInt(half) - randInt(half));
}

function combat(m1, m2) {
	if (rand() > m1.defense) damage(m1, DMG);
	if (rand() > m2.defense) damage(m2, DMG);
}

function pillage(m) {
	const b = getBuildingOn(m);
	if (!b) return;
	resetProductionCooldown(b);
	if (rand() < 0.5) { // Slow down the pillaging a little bit
		if (b.inv.length) b.inv.pop();
	}
}

/** Removes a list of resources from a building or meeple - all or nothing. Returns what's left to consume. */
function consumeResources(w, arr = [], allOrNothing = F) {
	if (!arr.length) return [];
	if (allOrNothing && !doesInvHave(w.inv, arr)) return [...arr];
	return removeInvResources(w.inv, arr);
}

/** Make resources and add to a building  */
function createResources(b, arr = []) {
	// Special case: if output is a meeple, try to make a new person
	if (arr.includes('meeple')) {
		// TODO LATER: Allow multiple meeple to be created?
		// TODO LATER: Allow meeple and other resources to be created at once?
		const { x, y } = b;
		const m = addCitizen({ x, y });
		return Boolean(m);
	}
	if (arr.includes('karma')) {
		arr.forEach((res) => {
			if (res === Ka) g.karma += KARMA_PER_RESOURCE;
		});
		// TODO LATER: allow karma and other resources to be created together
		return T;
	}
	if (isFull(b)) return F;
	b.inv = b.inv.concat([...arr]);
	return T;
}

function produce(b, delta) {
	const type = buildingTypes[b.type];
	if ((!type.output && !type.input) || !b.on) return; // Doesn't produce or not on
	if (!type.input.length) b.supplied = T; // always supplied if no inputs
	if (!b.supplied) {
		// Consume but only if we have all input in inventory
		const left = consumeResources(b, type.input, T);
		if (left.length > 0) return; // Did not consume all? Probably doesn't have it yet
		b.supplied = T;
		return;
	}
	const workers = Math.min(countWorkers(b), MAX_WORKERS);
	// Reduce cooldown by delta
	// Adjust delta based on who's working at building
	const defaultMult = (type.autoWork) ? 1 : 0;
	const mult = (workers) ? workers / (workers ** 0.55) : defaultMult;
	// console.log(workers, mult);
	const workDelta = delta * mult;
	b.prodCool -= workDelta;
	if (b.prodCool > 0) return; // Still producing
	// Production is done
	b.prodCool = 0;
	const didCreate = createResources(b, type.output);
	if (!didCreate) {
		// If the creation failed then bail out and keep trying
		return;
	}
	b.supplied = F;
	resetProductionCooldown(b, b.prodCool);
}

/** Drop resource from meeple to building */
function dropResource(m, b) {
	if (!m.inv.length) return F; // Nothing to give
	if (!isOnBuilding(m, b)) return F;
	const res = m.inv.shift(); // Take from top because we check index 0 when determining where to drop
	// TODO LATER: Worry about overflowing the destination building
	b.inv.push(res);
	return T;
}

/** Meeple takes resource from building */
function pickUpResource(m, b, resParam /* optional */) {
	if (m.inv.length > 0) return F; // No room
	if (!isOnBuilding(m, b)) return F;
	const unneeded = getUnneededResources(b);
	if (!unneeded.length) return F;
	// If resParam and is in arr, then use that, otherwise pick random res from arr
	const res = (resParam && unneeded.includes(resParam)) ? resParam : randPick(unneeded);
	const left = consumeResources(b, [res], T);
	if (left.length > 0) return F;
	m.inv.push(res);
	return T;
}

/** Mutates meeple's path to remove spots from the front the path if the meeple has arrived
 * - Returns true if arrived somewhere
*/
function checkArrivalTrimPath(m) {
	if (m.path.length) {
		// console.log(m.x, m.y, m.path, atPoint(m, m.path[0]));
		if (atPoint(m, m.path[0])) {
			m.path.shift();
			return T;
		}
	}
	return F;
}

function setPathTo(m, spot, limitLength) {
	let destVec = vec2(spot);
	if (limitLength) {
		const mVec = vec2(m);
		let diff = destVec.subtract(mVec);
		diff = diff.clampLength(limitLength);
		destVec = mVec.add(diff);
	}
	const { x, y } = destVec;
	m.path = [{ x, y }];
}

function setPathToRandBuilding(m, bKeysParam) {
	let bKeys = (typeof bKeysParam === 'string') ? [bKeysParam] : bKeysParam;
	if (!bKeys.length) bKeys = g.buildingKeys;
	const bKey = randPick(bKeys);
	// console.log('Pick random building', bKey);
	if (bKey === undefined) return;
	m.path = getPathToBuilding(g.buildings[bKey], m);
}

function moveTo(m, dest, deltaT, speed) {
	const maxDist = deltaT * speed;
	const mVec = vec2(m);
	const moveVec = vec2(dest).subtract(mVec).clampLength(maxDist);
	setVec(m, mVec.add(moveVec));
}

function moveWorking(m, delta) {
	// TODO: fix to only move within the circle of the production building
	const dist = delta * WORK_SPEED * 0.25;
	m.x += dist * randSign();
	m.y += dist * randSign();
}

function nonCarrierDropOff(m) {
	if (!m.inv.length) return {};
	const b = getBuildingOn(m);
	if (!b) return {};
	const dropped = dropResource(m, b);
	return { b, dropped };
}

function simRest(m, delta) {
	if (g.invaderKeys.length) return; // only rest if there are no invaders
	if (m.hp < HP) {
		m.hp = Math.min(HP, m.hp + (delta * HEAL));
		return T;
	}
	return F;
}

function simIdle(m, delta) {
	checkArrivalTrimPath(m);
	if (!m.path.length) {
		nonCarrierDropOff(m);
		// TODO LATER: Do a momentary rest? If rested then continue
		// Choose a new random destination and path
		setPathToRandBuilding(m, g.buildingKeys);
		return;
	}
	if (simRest(m, delta)) return;
	// Move towards first spot of the path
	moveTo(m, m.path[0], delta, IDLE_SPEED);
}

function simProd(m, delta) {
	checkArrivalTrimPath(m);
	if (!m.path.length) {
		nonCarrierDropOff(m);
		if (isMeepleWorkingAt(m)) {
			moveWorking(m, delta);
			return;
		}
		const prodBKeys = filterBuildingKeys((b, bt) => (
			isBuildingProducing(b) && bt.classification === '🪚'
		));
		setPathToRandBuilding(m, prodBKeys);
		return;
	}
	if (simRest(m, delta)) return;
	// Move towards first spot of the path
	moveTo(m, m.path[0], delta, PROD_SPEED);
}

function simCarrier(m, delta) {
	const arrived = checkArrivalTrimPath(m);
	if (!m.path.length) {
		let bKeys = [];
		const b = getBuildingOn(m);
		if (m.inv.length) { // We have something...
			if (arrived && b) { // If we just arrived somewhere, then try to do the drop off
				// console.log('Attempt drop');
				dropResource(m, b);
				return;
			}
			// Otherwise find a location to drop-off
			bKeys = filterBuildingKeys((b, bt) => {
				return needsResource(b, m.inv[0]) && !isFull(b);
			});
			if (bKeys.length === 0) {
				// If we don't have a proper place to drop-off, then go to storage
				bKeys = filterBuildingKeys((b, bt) => (bt.classification === '📦' && !isFull(b) && b.on));
			}
		} else { // We don't have anything in inventory...
			if (arrived && b) {
				// console.log('Attempt pickup');
				pickUpResource(m, b);
				return;
			}
			// Otherwise find a location to pick up from
			bKeys = filterBuildingKeys((b, bt) => {
				return hasUnneededResources(b);
			});
			// TODO: Limit to nearest 1-3?
		}
		setPathToRandBuilding(m, bKeys);
		return;
	}
	if (simRest(m, delta)) return;
	const speed = CARR_SPEED * (m.inv.length ? ENCUMBER : 1);
	// Move towards first spot of the path
	moveTo(m, m.path[0], delta, speed);
}

function simDefend(m, delta) {
	checkArrivalTrimPath(m);
	if (!m.path.length) {
		nonCarrierDropOff(m);
		const b = getBuildingOn(m);
		const onDefB = (b && buildingTypes[b.type].classification === '🛡️');
		// If we're on a defense place then increase defense score
		if (onDefB) {
			m.defense = Math.min(m.defense + 0.01, DEF_DEF);
		}
		// If invaders, then go to them
		if (g.invaderKeys.length > 0) {
			const target = g.meeples[randPick(g.invaderKeys)];
			setPathTo(m, target, DEFENDER_PATH_RANGE);
			return;
		}
		// Patrol between defense
		let defBKeys = filterBuildingKeys((b1, bt) => (
			bt.classification === '🛡️' && (!onDefB || b.key !== b1.key)
		));
		setPathToRandBuilding(m, defBKeys);
		return;
	}
	if (simRest(m, delta)) return;
	// Move towards first spot of the path
	moveTo(m, m.path[0], delta, MEEP_SPEED);
}

function simSpirit(m, delta) {
	checkArrivalTrimPath(m);
	if (!m.path.length) {
		if (isMeepleWorkingAt(m)) {
			moveWorking(m, delta);
			return;
		}
		const bKeys = filterBuildingKeys((b, bt) => (isBuildingProducing(b) && bt.classification === '🪷'));
		setPathToRandBuilding(m, bKeys);
		return;
	}
	if (simRest(m, delta)) return;
	// Move towards first spot of the path
	moveTo(m, m.path[0], delta, MEEP_SPEED);
}

function simInvader(m, delta) { // aka. simKiller
	checkArrivalTrimPath(m);
	pillage(m);
	if (!m.path.length) {
		// Pick targets from any other
		const opponentKeys = g.citizenKeys; // g.citizenKeys.filter((key) => (g.meeples[key].faction !== m.faction));
		let target = g.meeples[randPick(opponentKeys)];
		if (rand() < 0.3) { // chance that we target the nearest one instead
			const { nearest } = getNearestMeeple(m, opponentKeys);
			target = nearest;
		}
		setPathTo(m, target, INVADER_PATH_RANGE);
		return;
	}
	// Move towards first spot of the path
	moveTo(m, m.path[0], delta, MEEP_SPEED);
}

function simCombat() {
	const opponentKeys = g.citizenKeys; // g.citizenKeys.filter((key) => (g.meeples[key].faction !== m.faction));
	g.invaderKeys.forEach((invaderKey) => {
		const invader = g.meeples[invaderKey];
		const { nearest, distance } = getNearestMeeple(invader, opponentKeys);
		if (distance <= MELEE_DIST) {
			combat(invader, nearest);
		}
	});
}

function simulate(delta) { // Do updating of world
	const simMeepleKey = (key) => {
		const m = g.meeples[key];
		if (m.hp <= 0) {
			destroyMeeple(m);
			return;
		}
		const simJob = {
			idle: simIdle,
			prod: simProd,
			carr: simCarrier,
			defe: simDefend,
			spir: simSpirit,
			kill: simInvader,
		};
		if (simJob[m.job]) simJob[m.job](m, delta);
	};
	g.citizenKeys.forEach(simMeepleKey);
	g.invaderKeys.forEach(simMeepleKey);
	g.buildingKeys.forEach((k) => {
		const b = g.buildings[k];
		produce(b, delta);
	});
	simCombat();
}

/** Spawn invaders */
function invade(n) {
	for (let i = 0; i < n; i += 1) {
		addInvader();
	}
	g.countdown = COUNTDOWN;
}

function loop() {
	if (!g.looping) return;
	const now = Number(new Date());
	const delta = (g.lastTime) ? now - g.lastTime : 0;
	g.lastTime = now;
	if (g.peace) {
		g.countdown = 0;
	} else {
		g.countdown -= delta;
		if (g.countdown <= 0) invade(g.citizenKeys.length);
	}
	simulate(delta);
	render();
	setTimeout(loop, 100);
}

function startLoop() {
	g.looping = true;
	g.lastTime = 0;
	loop();
}

function stopLoop() {
	g.looping = false;
	// TODO: cancel timeout timer
}

/* ------------------------------ Actions ------------------ */

function selectBuilding(b) {
	g.selectedBuildingKey = b.key;
}

function tapWorld(e) {
	const t = e.target;
	const classes = t.classList;
	// if (g.state === 'intro') {
	// 	ZZFX.x = new AudioContext();
	// 	ZZFX.x.resume();
	// }
	// start game if not started
	g.state = 'game';
	// ZZFX.play(...[1.01,,458,.02,,.01,4,.98,26,,-95,.05,,,28,,,.08]);
	if (classes.contains('building')) {
		const b = g.buildings[t.closest('g').id];
		if (g.creating && g.selectedBuildingKey) {
			addRoad(b.key, g.selectedBuildingKey);
			g.creating = false;
		}
		selectBuilding(b);
	} else if (g.creating && g.selectedBuildingKey) {
		g.creating = false;
		// const { clientX, clientY, layerX, layerY, offsetX, offsetY, pageX, pageY, screenX, screenY } = e;
		// console.log({ clientX, clientY, layerX, layerY, offsetX, offsetY, pageX, pageY, screenX, screenY });
		const b = addBuilding({ x: e.offsetX, y: e.offsetY, type: 'connector' }, g.selectedBuildingKey);
		selectBuilding(b);
	} else {
		g.selectedBuildingKey = N;
		g.upgradesOpen = F;
		g.assigning = F;
	}
	e.preventDefault();
	render();
}

function handleTap(e, tapMap = {}) {
	const t = e.target;
	// console.log(t);
	Object.keys(tapMap).forEach((key) => {
		const el = t.closest(key);
		if (el) tapMap[key](e, el);
	});
	renderUi();	
}

function tapTopUi(e) {
	handleTap(e, {
		'.up-action': (e, el) => {
			const { building, upgrade } = el.dataset;
			upgradeBuilding(building, upgrade);
			g.creating = F;
		},
		'#b-on': () => g.buildings[g.selectedBuildingKey].on = T,
		'#b-off': () => g.buildings[g.selectedBuildingKey].on = F,
		'#cd': () => g.countdown -= (10 * 1000),
		// '#b-up-toggle': () => g.upgradesOpen = !g.upgradesOpen,
		'#kamikaze': () => {
			if (g.karma < WIND_KARMA) return;
			g.karma -= WIND_KARMA;
			g.countdown += COUNTDOWN / 2;
			g.kamikazes += 1;
			if (g.kamikazes >= 2) {
				g.peace = T;
				showFlashMessage('Kamikaze!', 'Another divine wind washes away the Khan\'s fleet! Kublai Khan decides Japan is not worth conquering. You win!', '💨🌪️🌊');
			} else {
				showFlashMessage('Kamikaze!', 'A divine wind washes away the Khan\'s fleet!', '💨🌪️🌊');
			}
		},
	});
}

function tapBottomUi(e) {
	const incRange = (e, n) => { // jass
		const range = e.target.parentNode.querySelector('input[type="range"]');
		setInputAttr(range, 'value', Number(range.value || 0) + n);
		const event = new Event('change');
		range.dispatchEvent(event);
		// render();
		// renderJobAssignment();
	};
	handleTap(e, {
		'#play': startLoop,
		'#pause': stopLoop,
		'#build': () => g.creating = T,
		'#upgra': () => {
			g.upgradesOpen = !g.upgradesOpen;
			g.creating = F;
			g.assigning = F;
		},
		'#cancel': () => g.creating = F,
		'#restart': () => window.location.reload(),
		'#jobs': () => {
			g.upgradesOpen = F;
			g.creating = F;
			g.assigning = !(g.assigning);
			renderJobAssignment();
		},
		'.dec-range': (e) => incRange(e, -1),
		'.inc-range': (e) => incRange(e, 1),
	});
}

function setupDom() {
	setHtml('#jass', `<div>Loyal to Hōjō clan: <span id="mcounts"></span>
		<br><span class="altname">Build houses or towers to increase capacity.</span></div>
		<ul>${JOB_KEYS.map((j, i) => {
		const job = JOBS_OBJ[j];
		return `<li id="jr-${j}">
			<label for="input-${j}">
				<span>
					${job.name}
					<span class="altname">(${job.altName})</span>
				</span>
				<i>${job.classification}</i>
			</label><b><span class="jr-num"></span></b>
			<div class="jass-ui">
				<button class="dec-range">-</button>
				<input id="input-${j}" type="range" min="0">
				<button class="inc-range">+</button>
			</div>
		</li>`
	}).join('')}</ul>`);
	// const { size } = g.world;
	// // setAttr('#intro', { style: `transform: translateX(${g.size/2}px)`})
	// $('#intro').style.transform = `translateX(${size/2}px)`;
	// $('#intro-bg').style.width = `${size/2}px`;
	// $('#intro-bg').style.height = `${size}px`;
}

function setupEvents(w) {
	const { el } = w;
	/*
	// Requires that the element has draggable true
	setAttr(el, { draggable: 'true' });
	let dragEvent;
	on(el, 'dragstart', (e) => {
		e.dataTransfer.setData('text/plain', 'w'); // this is required to be draggable
		e.dataTransfer.effectAllowed = 'move';
		// console.log('start', e);
		dragEvent = e;
	});
	on(el, 'drop', (e) => {
		// console.log('drop', e);
		w.x += e.clientX - dragEvent.clientX;
		w.y += e.clientY - dragEvent.clientY;
		render();
	});
	on($('main'), 'dragover', (e) => {
		e.preventDefault(); // this signifies that things can be dropped here
	});
	*/
	// The native draggable capabilities did not work on mobile, so we're trying the following
	// which uses "pointer" events.
	let pickupEvent;
	const pickupWorldCoords = { x: w.x, y: w.y };
	const cancelPickup = (e) => {
		pickupEvent = N;
		g.moving = F;
		render();
	};
	on(el, 'pointerup', cancelPickup);
	on(el, 'pointercancel', cancelPickup);
	on(el, 'pointerout', cancelPickup);
	on(el, 'pointerleave', cancelPickup);
	on(el, 'pointermove', (e) => {
		if (pickupEvent) {
			const delta = { x: e.clientX - pickupEvent.clientX, y: e.clientY - pickupEvent.clientY };
			w.x = pickupWorldCoords.x + delta.x; // ** 1.1;
			w.y = pickupWorldCoords.y + delta.y; // ** 1.1;
			render();
		}
	});
	on(el, 'pointerdown', (e) => {
		tapWorld(e);
		g.moving = T;
		pickupEvent = e;
		pickupWorldCoords.x = w.x;
		pickupWorldCoords.y = w.y;
	});
	// TODO: Fix construction so it takes into account the zoom level, 
	// then re-enable zoom
	/*
	on($('body'), 'wheel', (e) => {
		g.zoom = Math.min(Math.max(g.zoom + (e.deltaY * -0.001), 0.1), 3);
		render();
		console.log(e.deltaY);
	});
	*/
	on($('#flash'), 'pointerdown', (e) => {
		g.flashMessage = N;
		render();
	});
	on($('#bui'), 'pointerdown', tapBottomUi);
	on($('#tui'), 'pointerdown', tapTopUi);
	// Job assignment UI
	loopJobs((job, input) => {
		on(input, 'change', (e) => { // jass
			const desiredJobCounts = getAdjustedJobCounts(job, Number(input.value) || 0);
			// console.log('Desiring', desiredJobCounts);
			assignJobs(desiredJobCounts);
			renderJobAssignment();
			render();
		});
	});
}

function start() {
	const width = window.innerWidth * WIDTH_MULT;
	const height = window.innerHeight;
	const c = $('#wc');
	setAttr(c, { width, height });
	const el = $('#w');
	const svg = $('#ws');
	setAttr(svg, { viewBox: `0 0 ${width} ${height}`});
	g.world = {
		c,
		el,
		svg,
		width,
		height,
		ctx: c.getContext('2d'),
		layers: {
			road: $('#layer-road'),
			building: $('#layer-building'),
			// resource: $('#layer-resource'),
			meeple: $('#layer-meeple'),
		},
		x: width * -0.5,
		y: 0,
	};
	setupDom();
	setupEvents(g.world);
	const x = (width / 2) - 40;
	const y = height / 2;
	const b = addBuilding({ type: 'outpost', x, y });
	b.inv = [W, W];
	addBuilding({ type: 'connector', x: x - (100 + randInt(width / 6)), y: y + randInt(200) - randInt(200) }, b.key);
	addCitizen();
	addCitizen();
	addCitizen();
	render();
}

const g = window.g = {
	state: 'intro',
	world: {},
	buildings: {},
	buildingKeys: [],
	meeples: {},
	citizenKeys: [],
	invaderKeys: [],
	roads: {},
	roadKeys: [],
	flashMessage: N,
	selectedBuildingKey: N,
	upgradesOpen: F,
	countdownEl: N,
	peace: F,
	kamikazes: 0, // count them
	lastTime: 0,
	karma: 0,
	countdown: INITIAL_COUNTDOWN,
	looping: F,
	moving: F,
	creating: F,
	assigning: F,
	godMode: F,
	zoom: 1,
	start,
	// test
	destroyMeeple,
};
window.$ = $;
document.addEventListener('DOMContentLoaded', g.start);
