(function () {
	'use strict';

	const WORLD_SIZE = 1000;
	const Gr = 'grain',
		Ri = 'rice',
		Ka = 'karma',
		S = 'stone',
		Or = 'ore',
		W = 'wood';
	const T = true;
	const F = false;
	const N = null;
	const MEEP_SPEED = 100 * (1/1000); // pixels per second * s/ms

	const $ = (q) => document.querySelector(q);
	const $id = (id) => document.getElementById(id);
	const on = (el, type, fn) => el.addEventListener(type, fn);
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
	const randSign = () => (rand(2)|0) * 2 - 1;
	const JOBS = [
		'idle',
		'prod',
		'carr',
		'defe',
		'spir',
	];

	const buildingTypes = {
		// r = radius, cap = resource capacity, mm = max meeples
		outpost: {
			r: 10, cap: 19, cost: [W, W, S, S],
			defenderMax: 2, popMax: 10,
		},
		connector: {
			r: 10, cap: 4, cost: [S],
			upgrades: ['stoneMine', 'grainFarm', 'tower', 'shrine', 'farmHouse', 'woodCutter', 'stockpile'],
		},
		stockpile: {
			r: 30, cap: 20, cost: [S, W],
		},
		woodCutter: {
			r: 10, cap: 6, cost: [W],
			input: [], output: [W], rate: 2,
		},
		stoneMine: {
			r: 10, cap: 6, cost: [W],
			input: [], output: [W], rate: 2,
			upgrades: ['oreMine'],
		},
		oreMine: {
			r: 10, cap: 6, cost: [W],
			input: [], output: [Or], rate: 2,
		},
		tower: {
			r: 14, cap: 2, cost: [S, W, W],
			defenderMax: 5,
			upgrades: ['fortress'],
		},
		fortress: {
			r: 20, cap: 4, cost: [S, S, S, S, W],
			defenderMax: 8,
		},
		grainFarm: {
			r: 20, cap: 10, cost: [W, W],
			input: [], output: [Gr], rate: 2,
			upgrades: ['riceFarm'],
		},
		riceFarm: {
			r: 10, cap: 6, cost: [W],
			input: [], output: [Ri], rate: 2,
		},
		shrine: {
			r: 10, cap: 6, cost: [W],
			input: [Ri], output: [Ka], rate: 2,
			upgrades: ['temple'],
		},
		temple: {
			r: 10, cap: 6, cost: [W],
			input: [Ri], output: [Ka, Ka],
		},
		farmHouse: { // noka 
			r: 10, cap: 6, cost: [W],
			input: [Gr], output: ['meeple'],
			popMax: 4,
			upgrades: ['urbanHouse'],
		},
		urbanHouse: { // machiya
			r: 10, cap: 6, cost: [W],
			input: [Ri], output: ['meeple'],
			popMax: 8,
		},
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

	/* ------------------------------ Adding ------------------ */

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

	function addBuilding(bParam = {}, fromBuildingKey = N) {
		const b = {
			key: getRandomKey('B'),
			type: 'connector',
			// x: 0,
			// y: 0,
			on: true,
			resources: [W, S, W, Gr],
			refresh: false, // remove rendered element and recreate
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

	function addMeeple(mParam = {}) {
		const m = {
			key: getRandomKey('M'),
			job: 'idle',
			hp: 100,
			carry: N,
			weapon: N,
			buildingKey: N, // goal
			path: [],
			...getRandomWorldLocation(),
			...mParam,
		};
		if (g.meeples[m.key]) throw new Error('Existing meeple');
		console.log('Adding meeple', m);
		g.meeples[m.key] = m;
		g.meepleKeys.push(m.key);
		return m;
	}

	/* ------------------------------ Jobs ------------------ */

	function getBlankJobCounts() {
		return JOBS.reduce((o, j) => ({ ...o, [j]: 0 }), {});
	}

	function getJobCounts() {
		return g.meepleKeys.reduce((counts, key) => {
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
		const leftJobs = JOBS.reduce((arr, j) => {
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
		g.meepleKeys.forEach((key) => {
			const m = g.meeples[key];
			// Still need this job, so keep job and increment count
			if (stillNeedJob(m.job)) {
				incrementJob(m.job);
				return;
			}
			// Give the meeple a new job
			m.job = JOBS.find(stillNeedJob) || 'idle';
			incrementJob(m.job);
		});
		console.log('Meeples assigned jobs:', g.meeples, 'desired:', desiredJobCounts, 'final:', currJobCounts);
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

	function addMeepleSvg(m, layer) {
		const circle = createAppendSvg('circle', layer);
		circle.id = m.key;
		setAttributes(circle, {
			cx: 0, // m.x,
			cy: 0, // m.y,
			r: 7, // MEEPLE_SIZE
			class: `meeple meeple-${m.job}`,
		});
		return circle;
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
			if (bEl && b.refresh) {
				bEl.remove();
				bEl = N;
			}
			if (!bEl) bEl = addBuildingSvg(b, layers.building);
			renderBuildingResources(b);
			bEl.classList.toggle('selectedb', (key === g.selectedBuildingKey));
		});
		g.roadKeys.forEach((key) => {
			const r = g.roads[key];
			let rEl = $id(key);
			if (!rEl) rEl = addRoadSvg(r, layers.road);
		});
		g.meepleKeys.forEach((key) => {
			const m = g.meeples[key];
			let mEl = $id(key);
			if (!mEl) mEl = addMeepleSvg(m, layers.meeple);
			mEl.style.cx = m.x;
			mEl.style.cy = m.y;
		});
	}

	function loopJobs(fn) {
		JOBS.forEach((job) => {
			const el = $(`#jr-${job}`);
			const input = el.querySelector('[type="range"]');
			fn(job, input, el);
		});
	}

	function renderUi() {
		const classes = $('main').classList;
		classes.toggle('bselected', g.selectedBuildingKey);
		classes.toggle('looping', g.looping);
		classes.toggle('creating', g.creating);
		classes.toggle('assigning', g.assigning);
		classes.toggle('pop', g.meepleKeys.length > 0);
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
		// Assigning Jobs
		if (g.assigning) {
			const counts = getJobCounts();
			const maxMeeples = g.meepleKeys.length;
			const maxDefenders = 1;
			loopJobs((job, input, el) => {
				const num = el.querySelector('b');
				num.innerText = counts[job];
				input.setAttribute('max', (job === 'defe') ? maxDefenders : maxMeeples);
				input.setAttribute('value', counts[job]);
				input.value = counts[job];
			});
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

	function simulate(delta) {
		// TODO: Do updating of world
		g.meepleKeys.forEach((key) => {
			const m = g.meeples[key];
			if (m.job === 'idle') {
				const dist = delta * MEEP_SPEED * 0.5;
				m.x += dist * randSign();
				m.y += dist * randSign();
			}
		});
	}

	function loop() {
		if (!g.looping) return;
		const now = Number(new Date());
		const delta = (g.lastTime) ? now - g.lastTime : 0;
		g.lastTime = now;
		g.countdown -= delta;
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
		return `${b.type} : ${b.resources.join(', ')}`;
	}

	function tapWorld(e) {
		const t = e.target;
		const classes = t.classList;
		let binfo = '';
		if (classes.contains('building')) {
			const b = g.buildings[t.closest('g').id];
			if (g.creating && g.selectedBuildingKey) {
				addRoad(b.key, g.selectedBuildingKey);
				g.creating = false;
			}
			binfo = selectBuilding(b);
		} else 	if (g.creating && g.selectedBuildingKey) {
			g.creating = false;
			const b = addBuilding({ x: e.clientX, y: e.clientY, type: 'connector' }, g.selectedBuildingKey);
			binfo = selectBuilding(b);
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
		// console.log(t);
		const taps = {
			'#play': startLoop,
			'#pause': stopLoop,
			'#build': () => g.creating = T,
			'#cancel': () => g.creating = F,
			'#restart': () => window.location.reload(),
			'#jobs': () => g.assigning = !(g.assigning),
		};
		Object.keys(taps).forEach((key) => {
			if (t.closest(key)) taps[key]();
		});
		renderUi();
	}

	function setupEvents(w) {
		const { el } = w;
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
		on(el, 'pointerdown', tapWorld);
		on($id('bui'), 'pointerdown', tapBottomUi);
		on($id('tui'), 'pointerdown', tapTopUi);
		// Job assignment UI
		loopJobs((job, input) => {
			on(input, 'change', (e) => {
				const desiredJobCounts = getAdjustedJobCounts(job, Number(input.value) || 0);
				console.log('Desiring', desiredJobCounts);
				assignJobs(desiredJobCounts);
				renderUi();
			});
		});
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
		addMeeple();
		addMeeple();
		addMeeple();
		render(w);
	}



	const g = window.g = {
		state: 'game',
		world: {},
		buildings: {},
		buildingKeys: [],
		meeples: {},
		meepleKeys: [],
		roads: {},
		roadKeys: [],
		selectedBuildingKey: N,
		countdownEl: N,
		lastTime: 0,
		countdown: 300000, // 5 minutes * 60 seconds/min * 1000 ms/sec
		looping: F,
		creating: F,
		assigning: F,
		start,
		getJobCounts,
		assignJobs,
	};
	document.addEventListener('DOMContentLoaded', g.start);

})();
