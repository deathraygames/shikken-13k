(function () {
	'use strict';

	const WORLD_SIZE = 1000;
	const G = 'grain';
	const S = 'stone';
	const W = 'wood';
	const T = true;
	const F = false;
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

	const buildingTypes = {
		// r = radius, cap = resource capacity, mm = max meeples
		connector: { r: 10, cap: 4, cost: [S] },
		tower: { r: 14, cap: 2, cost: [S, W, W]},
		farm: { r: 20, cap: 10, cost: [W, W] },
		barracks: { r: 20, cap: 2, cost: [W, W] },
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
			on: true,
			resources: [W, S, W, G],
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

	/* ------------------------------ Rendering ------------------ */

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

	function renderBuildingResources(b, bEl) {
		b.resources.forEach((res) => {
			// bEl.
			// TODO...
		});
	}

	function renderSvg(layers) {
		// TODO: render roads as lines
		g.buildingKeys.forEach((key) => {
			const b = g.buildings[key];
			let bEl = $id(key);
			if (!bEl) bEl = addBuildingSvg(b, layers.building);
			renderBuildingResources(b);
			bEl.classList.toggle('selectedb', (key === g.selectedBuildingKey));
		});
		g.roadKeys.forEach((key) => {
			const r = g.roads[key];
			let rEl = $id(key);
			if (!rEl) rEl = addRoadSvg(r, layers.road);
		});
	}

	function renderUi() {
		const classes = $('main').classList;
		classes.toggle('bselected', g.selectedBuildingKey);
		classes.toggle('looping', g.looping);
		classes.toggle('creating', g.creating);
		classes.toggle('pop', g.totalMeeples > 0);
		// Update countdown
		if (!g.countdownEl) g.countdownEl = $id('cd');
		let cd = g.countdown;
		const mins = Math.floor(cd * (1/1000) * (1/60));
		cd -= (mins * 1000 * 60);
		const sec = Math.floor(cd * (1/1000));
		g.countdownEl.innerText = `${mins}:${sec < 10 ? '0' : ''}${sec}`;
		// List
		if (g.creating) {
			$id('blist').innerHTML = Object.keys(buildingTypes).map((key) => `<li>${key}</li>`).join('');
		}
	}

	function render() {
		const w = g.world;
		w.el.style.top = `${w.y}px`;
		w.el.style.left = `${w.x}px`;
		renderCanvas(w.ctx);
		renderSvg(w.layers);
		renderUi();
	}

	/* ------------------------------ Looping ------------------ */

	function loop() {
		if (!g.looping) return;
		const now = Number(new Date());
		const delta = (g.lastTime) ? now - g.lastTime : 0;
		g.lastTime = now;
		g.countdown -= delta;
		// TODO: Do updating of world

		// TODO: Get total of meeples: totalMeeples

		renderUi();
		setTimeout(loop, 100);
	}

	function startLoop() {
		g.looping = true;
		loop();
	}

	function stopLoop() {
		g.looping = false;
		// TODO: cancel timeout timer
	}

	/* ------------------------------ Actions ------------------ */

	function tapWorld(e) {
		const t = e.target;
		const classes = t.classList;
		let binfo = '';
		if (classes.contains('building')) {
			const b = g.buildings[t.closest('g').id];
			console.log(t);
			if (!b) throw new Error(`Unknown building ${t.id}`);
			binfo = b.type;
			g.selectedBuildingKey = b.key;
		} else if (g.creating && g.selectedBuildingKey) {
			const b = addBuilding({ x: e.clientX, y: e.clientY, type: 'connector' }, g.selectedBuildingKey);
			binfo = b.type;
			g.selectedBuildingKey = b.key;
			g.creating = false;
		} else {
			g.selectedBuildingKey = N;
			if (classes.contains('road')) {
				binfo = 'road';
			}
		}
		$id('binfo').innerHTML = binfo;
		render();
	}

	function tapTopUi(e) {
	}

	function tapBottomUi(e) {
		const t = e.target;
		console.log(t);
		const taps = {
			'#play': startLoop,
			'#pause': stopLoop,
			'#build': () => g.creating = T,
			'#cancel': () => g.creating = F,
			'#restart': () => window.location.reload(),
		};
		Object.keys(taps).forEach((key) => {
			if (t.closest(key)) taps[key]();
		});
		renderUi();
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
		selectedBuildingKey: N,
		countdownEl: N,
		lastTime: 0,
		countdown: 300000, // 5 minutes * 60 seconds/min * 1000 ms/sec
		looping: F,
		creating: F,
		totalMeeples: 0,
		start,
	};
	document.addEventListener('DOMContentLoaded', g.start);

})();
