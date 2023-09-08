(function () {
    'use strict';

    /** Asserts if the experssion is false, does not do anything in release builds
     *  @param {Boolean} assertion
     *  @param {Object}  output
     *  @memberof Debug */
    const ASSERT = window.enableAsserts ? (...assert)=> console.assert(...assert) : ()=>{};

    /** 
     * 2D Vector object with vector math library
     * <br> - Functions do not change this so they can be chained together
     * @example
     * let a = new Vector2(2, 3); // vector with coordinates (2, 3)
     * let b = new Vector2;       // vector with coordinates (0, 0)
     * let c = vec2(4, 2);        // use the vec2 function to make a Vector2
     * let d = a.add(b).scale(5); // operators can be chained
     */
    class Vector2
    {
        /** Create a 2D vector with the x and y passed in, can also be created with vec2()
         *  @param {Number} [x=0] - X axis location
         *  @param {Number} [y=0] - Y axis location */
        constructor(x=0, y=0)
        {
            /** @property {Number} - X axis location */
            this.x = x;
            /** @property {Number} - Y axis location */
            this.y = y;
        }

        /** Returns a new vector that is a copy of this
         *  @return {Vector2} */
        copy() { return new Vector2(this.x, this.y); }

        /** Returns a copy of this vector plus the vector passed in
         *  @param {Vector2} vector
         *  @return {Vector2} */
        add(v) { ASSERT(v.x!=undefined); return new Vector2(this.x + v.x, this.y + v.y); }

        /** Returns a copy of this vector minus the vector passed in
         *  @param {Vector2} vector
         *  @return {Vector2} */
        subtract(v) { ASSERT(v.x!=undefined); return new Vector2(this.x - v.x, this.y - v.y); }

        /** Returns a copy of this vector times the vector passed in
         *  @param {Vector2} vector
         *  @return {Vector2} */
        multiply(v) { ASSERT(v.x!=undefined); return new Vector2(this.x * v.x, this.y * v.y); }

        /** Returns a copy of this vector divided by the vector passed in
         *  @param {Vector2} vector
         *  @return {Vector2} */
        divide(v) { ASSERT(v.x!=undefined); return new Vector2(this.x / v.x, this.y / v.y); }

        /** Returns a copy of this vector scaled by the vector passed in
         *  @param {Number} scale
         *  @return {Vector2} */
        scale(s) { ASSERT(s.x==undefined); return new Vector2(this.x * s, this.y * s); }

        /** Returns the length of this vector
         * @return {Number} */
        length() { return this.lengthSquared()**.5; }

        /** Returns the length of this vector squared
         * @return {Number} */
        lengthSquared() { return this.x**2 + this.y**2; }

        /** Returns the distance from this vector to vector passed in
         * @param {Vector2} vector
         * @return {Number} */
        distance(v) { return this.distanceSquared(v)**.5; }

        /** Returns the distance squared from this vector to vector passed in
         * @param {Vector2} vector
         * @return {Number} */
        distanceSquared(v) { return (this.x - v.x)**2 + (this.y - v.y)**2; }

        /** Returns a new vector in same direction as this one with the length passed in
         * @param {Number} [length=1]
         * @return {Vector2} */
        normalize(length=1) { const l = this.length(); return l ? this.scale(length/l) : new Vector2(0, length); }

        /** Returns a new vector clamped to length passed in
         * @param {Number} [length=1]
         * @return {Vector2} */
        clampLength(length=1) { const l = this.length(); return l > length ? this.scale(length/l) : this; }

        /** Returns the dot product of this and the vector passed in
         * @param {Vector2} vector
         * @return {Number} */
        dot(v) { ASSERT(v.x!=undefined); return this.x*v.x + this.y*v.y; }

        /** Returns the cross product of this and the vector passed in
         * @param {Vector2} vector
         * @return {Number} */
        cross(v) { ASSERT(v.x!=undefined); return this.x*v.y - this.y*v.x; }

        /** Returns the angle of this vector, up is angle 0
         * @return {Number} */
        angle() { return Math.atan2(this.x, this.y); }

        /** Sets this vector with angle and length passed in
         * @param {Number} [angle=0]
         * @param {Number} [length=1] */
        setAngle(a=0, length=1) { this.x = length*Math.sin(a); this.y = length*Math.cos(a); return this; }

        /** Returns copy of this vector rotated by the angle passed in
         * @param {Number} angle
         * @return {Vector2} */
        rotate(a) { const c = Math.cos(a), s = Math.sin(a); return new Vector2(this.x*c-this.y*s, this.x*s+this.y*c); }

        /** Returns the integer direction of this vector, corrosponding to multiples of 90 degree rotation (0-3)
         * @return {Number} */
        direction() { return abs(this.x) > abs(this.y) ? this.x < 0 ? 3 : 1 : this.y < 0 ? 2 : 0; }

        /** Returns a copy of this vector that has been inverted
         * @return {Vector2} */
        invert() { return new Vector2(this.y, -this.x); }

        /** Returns a copy of this vector with each axis floored
         * @return {Vector2} */
        floor() { return new Vector2(Math.floor(this.x), Math.floor(this.y)); }

        /** Returns the area this vector covers as a rectangle
         * @return {Number} */
        area() { return abs(this.x * this.y); }

        /** Returns a new vector that is p percent between this and the vector passed in
         * @param {Vector2} vector
         * @param {Number}  percent
         * @return {Vector2} */
        lerp(v, p) { ASSERT(v.x!=undefined); return this.add(v.subtract(this).scale(clamp(p))); }

        /** Returns true if this vector is within the bounds of an array size passed in
         * @param {Vector2} arraySize
         * @return {Boolean} */
        arrayCheck(arraySize) { return this.x >= 0 && this.y >= 0 && this.x < arraySize.x && this.y < arraySize.y; }

        /** Returns this vector expressed as a string
         * @param {float} digits - precision to display
         * @return {String} */
        toString(digits=3) 
        { return `(${(this.x<0?'':' ') + this.x.toFixed(digits)},${(this.y<0?'':' ') + this.y.toFixed(digits)} )`; }
    }

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
    // Speed in pixels per millisecond
    const MEEP_SPEED = 140 * (1/1000); // pixels per second * s/ms
    const IDLE_SPEED = MEEP_SPEED / 2;
    const WORK_SPEED = MEEP_SPEED * 0.75;
    const MAX_PATH_LOOK = 20;

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
    const setHtml = (sel, html) => {
    	const el = $(sel);
    	if (el.innerHTML === html) return false;
    	el.innerHTML = html;
    	return true;
    };

    // From LittleJs
    const rand = (a = 1, b = 0) => b + (a - b) * Math.random();
    const randInt = (a = 1, b = 0) => rand(a, b)|0;
    const randSign = () => (rand(2)|0) * 2 - 1;
    const vec2 = (x=0, y)=> x.x == undefined ? new Vector2(x, y == undefined? x : y) : new Vector2(x.x, x.y);
    // Other mini helpers
    const randPick = (arr) => arr[randInt(arr.length)];
    const atPoint = (v1, v2, within = 2) => (vec2(v1).distance(v2) <= within);
    const setVec = (o, v) => { o.x = v.x; o.y = v.y; return o; };
    const JOBS = [
    	'idle',
    	'prod',
    	'carr',
    	'defe',
    	'spir',
    ],
    	JOB_NAMES = [
    		'Wanderer (Idle)',
    		'Farmer/Artisan (Production)',
    		'Peasant (Carrying)',
    		'Samurai (Defenders)',
    		'Monk/Pilgrim (Spiritualist)',
    	];
    const baseType = {
    	name: '',
    	r: 10, // radius and computes max resources
    	cap: 0, // capacity (resources) -- TODO
    	cost: [], // cost to create/upgrade
    	upgrades: [], // upgrade paths from here
    	defMax: 0, // contribution to defense max meeples
    	popMax: 0, // contribution to max meeples
    	input: [], // input for production
    	output: [], // output of production
    	rate: 0, // rate of production: # of outputs per minute
    };
    const buildingTypesArr = [
    	{
    		key: 'outpost',
    		name: 'Outpost',
    		r: 20, cap: 19, cost: [W, W, S, S],
    		defMax: 2, popMax: 10,
    	},
    	{
    		key: 'connector',
    		r: 10, cap: 4, cost: [S],
    		upgrades: ['stoneMine', 'grainFarm', 'tower', 'shrine', 'farmHouse', 'woodCutter', 'stockpile'],
    	},
    	{
    		key: 'stockpile',
    		name: 'Stockpile',
    		r: 40, cap: 20, cost: [S, W],
    	},
    	{
    		key: 'woodCutter',
    		name: 'Woodcutter',
    		r: 20, cap: 6, cost: [W],
    		input: [], output: [W], rate: 2,
    	},
    	{
    		key: 'stoneMine',
    		name: 'Stone Mine',
    		r: 20, cap: 6, cost: [W],
    		input: [], output: [W], rate: 2,
    		upgrades: ['oreMine'],
    	},
    	{
    		key: 'oreMine',
    		name: 'Ore Mine',
    		r: 30, cap: 6, cost: [W],
    		input: [], output: [Or], rate: 2,
    	},
    	{
    		key: 'tower',
    		name: 'Watchtower',
    		r: 14, cap: 2, cost: [S, W, W],
    		defMax: 5,
    		upgrades: ['fortress'],
    	},
    	{
    		key: 'fortress',
    		name: 'Fortress',
    		r: 24, cap: 4, cost: [S, S, S, S, W],
    		defMax: 8,
    	},
    	{
    		key: 'grainFarm',
    		name: 'Grain farm',
    		r: 20, cap: 10, cost: [W, W],
    		input: [], output: [Gr], rate: 2,
    		upgrades: ['riceFarm'],
    	},
    	{
    		key: 'riceFarm',
    		name: 'Rice farm',
    		r: 24, cap: 6, cost: [W],
    		input: [], output: [Ri], rate: 2,
    	},
    	{
    		key: 'shrine',
    		name: 'Shrine',
    		r: 16, cap: 6, cost: [W],
    		input: [Ri], output: [Ka], rate: 2,
    		upgrades: ['temple'],
    	},
    	{
    		key: 'temple',
    		name: 'Temple',
    		r: 32, cap: 6, cost: [W],
    		input: [Ri], output: [Ka, Ka], rate: 2,
    	},
    	{ // noka
    		key: 'farmHouse',
    		name: 'Noka (farmhouse)',
    		r: 20, cap: 6, cost: [W],
    		input: [Gr], output: ['meeple'], rate: 10,
    		popMax: 4,
    		upgrades: ['urbanHouse'],
    	},
    	{ // machiya
    		key: 'urbanHouse',
    		name: 'Machiya (urban house)',
    		r: 30, cap: 6, cost: [W],
    		input: [Ri], output: ['meeple'], rate: 1,
    		popMax: 8,
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
    	return { x: randInt(WORLD_SIZE), y: randInt(WORLD_SIZE) };
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
    	b.prodCool = b.prodHeat;
    }

    function addBuilding(bParam = {}, fromBuildingKey = N) {
    	const b = {
    		key: getRandomKey('B'),
    		type: 'connector',
    		// x: 0,
    		// y: 0,
    		prodCool: 0,
    		prodHeat: 1,
    		on: true,
    		resources: [W, S, W, Gr],
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

    function addMeeple(mParam = {}) {
    	if (g.meepleKeys.length >= getPopMax()) {
    		console.warn('Could not add another meeple');
    		return false;
    	}
    	const m = {
    		key: getRandomKey('M'),
    		job: 'idle',
    		hp: 100,
    		carry: N,
    		weapon: N,
    		buildingKey: N, // goal
    		path: [],
    		// x: 0,
    		// y: 0,
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
    		m.path = []; // (m.path.length) ? [m.path[0]] : [];
    		incrementJob(m.job);
    	});
    	console.log('Meeples assigned jobs:', g.meeples, 'desired:', desiredJobCounts, 'final:', currJobCounts);
    }

    function payCost(b, cost) {
    	// TODO: affordCost check
    	// TODO: start at building and pay cost by consuming resources
    	return true;
    }

    function upgradeBuilding(bKey, upTypeKey) {
    	const b = g.buildings[bKey];
    	const { upgrades = [] } = buildingTypes[b.type];
    	if (!upgrades.includes(upTypeKey)) throw new Error(`Unknown upTypeKey`);
    	payCost(b, buildingTypes[upTypeKey].cost);
    	b.type = upTypeKey;
    	b.refresh = true;
    	resetProductionCooldown(b);
    	renderBuildings();
    }

    /* ------------------------------ Rendering ------------------ */

    function renderCanvas(ctx) {
    	// ctx.fillStyle = 'green';
    	// ctx.fillRect(10, 10, 150, 100);
    }

    function addBuildingSvg(b, layer) {
    	const type = buildingTypes[b.type];
    	const group = createAppendSvg('g', layer);
    	group.id = b.key;
    	const circle = createAppendSvg('circle', group);
    	setAttributes(circle, {
    		cx: b.x,
    		cy: b.y,
    		r: type.r,
    		class: `building b-${b.type}`,
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
    		class: `meeple mj-${m.job}`,
    	});
    	return circle;
    }

    function renderBuildingResources(b, bEl) {
    	b.resources.forEach((res) => {
    		// bEl.
    		// TODO...
    	});
    }

    function renderBuildings() {
    	const { layers } = g.world;
    	g.buildingKeys.forEach((key) => {
    		const b = g.buildings[key];
    		let bEl = $id(key);
    		if (bEl && b.refresh) {
    			bEl.remove();
    			bEl = N;
    			b.refresh = F;
    		}
    		if (!bEl) bEl = addBuildingSvg(b, layers.building);
    		renderBuildingResources(b);
    		bEl.classList.toggle('selectedb', (key === g.selectedBuildingKey));
    	});
    }

    function renderSvg(layers) {
    	renderBuildings();
    	g.roadKeys.forEach((key) => {
    		const r = g.roads[key];
    		let rEl = $id(key);
    		if (!rEl) rEl = addRoadSvg(r, layers.road);
    	});
    	g.meepleKeys.forEach((key) => {
    		const m = g.meeples[key];
    		let mEl = $id(key);
    		if (!mEl) mEl = addMeepleSvg(m, layers.meeple);
    		// mEl.className = `meeple mj-${m.job}`;
    		mEl.setAttribute('class', `meeple mj-${m.job}`);
    		mEl.style.cx = m.x;
    		mEl.style.cy = m.y;
    	});
    }

    function loopJobs(fn) {
    	JOBS.forEach((job) => {
    		const el = $(`#jr-${job}`);
    		const input = el.querySelector('input[type="range"]');
    		const numEl = el.querySelector('b');
    		fn(job, input, el, numEl);
    	});
    }

    function renderJobAssignment() {
    	if (!g.assigning) return;
    	const counts = getJobCounts();
    	const maxMeeples = g.meepleKeys.length;
    	const maxDefenders = Math.min(maxMeeples, getDefenderMax());
    	loopJobs((job, input, el, numEl) => {
    		const n = counts[job];
    		numEl.innerText = n;
    		const max = (job === 'defe') ? maxDefenders : maxMeeples;
    		if (input.max !== max) {
    			input.setAttribute('max', max);
    			input.max = max;
    		}
    		if (input.value !== n) {
    			input.setAttribute('value', n);
    			input.value = n;
    		}
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
    	if (g.selectedBuildingKey) {
    		const b = g.buildings[g.selectedBuildingKey];
    		const { upgrades } = buildingTypes[b.type];
    		setHtml(
    			'#blist',
    			(upgrades)
    				? upgrades.map((key) => {
    					const { name = key, cost } = buildingTypes[key];
    					return `<li class=up-action data-upgrade="${key}" data-building="${g.selectedBuildingKey}">
						<span class=up-name>${name}</span>
						<span class=up-cost>${cost}</span>
					</li>`
    				}).join('')
    				: 'No upgrades'
    		);
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

    /* ------------------------------ Querying World ------------------ */

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

    function getBuildingOn(spot) {
    	const b = getNearestBuilding(spot);
    	if (!b) return null;
    	const bType = buildingTypes[b.type];
    	const dist = vec2(b).distance(spot);
    	return (dist > bType.r) ? null : b;
    }

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

    function getPathTo(b, from) {
    	const nearestB = getNearestBuilding(from);
    	if (!nearestB) return [];
    	const buildingPath = getPathBetween([nearestB.key], b.key);
    	const path = buildingPath.map((key) => {
    		const b = g.buildings[key];
    		return { key, x: b.x, y: b.y };
    	});
    	return path;
    }

    function isBuildingProducing(b) {
    	const bt = buildingTypes[b.type];
    	return (
    		((bt.input && bt.input.length) || (bt.output && bt.output.length))
    		&& b.on
    		// TODO LATER: Also check if it is clogged up
    	);
    }

    function isMeepleWorkingAt(m, bParam) {
    	const b = getBuildingOn(m);
    	if (!b) return false;
    	if (bParam && bParam.key !== b.key) return false;
    	// TODO: check if the building needs this worker
    	const bProd = isBuildingProducing(b);
    	return (m.job === 'prod' && bProd);
    }

    function countWorkers(b) {
    	return g.meepleKeys.reduce((sum, key) => (
    		sum + (isMeepleWorkingAt(g.meeples[key], b) ? 1 : 0)
    	), 0);
    }

    /** Does building have a list of resources? */
    function doesBuildingHave(b, arr = []) {
    	const leftOver = b.resources.reduce((left, res) => {
    		const i = left.indexOf(res);
    		if (i >= 0) left.splice(i, 1);
    		return left;
    	}, [...arr]);
    	return (leftOver.length === 0);
    }

    /* ------------------------------ Looping ------------------ */

    /** Removes a list of resources from a building - all or nothing */
    function consumeResources(b, arr = []) {
    	if (!arr.length) return true;
    	if (!doesBuildingHave(b, arr)) return false;
    	const left = [...arr]; // What's left to remove
    	// Loop over resources backwards because we'll be removing items, altering indices
    	for (let w = b.resources.length; w--; w >= 0) {
    		const res = b.resources[w];
    		const i = left.indexOf(res); // If this one that's left to remove
    		if (i >= 0) {
    			left.splice(i, 1);
    			b.resources.splice(w, 1);
    		}
    	}
    	return (left.length === 0);
    }

    /** Make resources and add to a building, ignoring any  */
    function createResources(b, arr = []) {
    	// Special case: if output is a meeple, try to make a new person
    	if (arr.includes('meeple')) {
    		// TODO LATER: Allow multiple meeple to be created?
    		// TODO LATER: Allow meeple and other resources to be created at once?
    		const { x, y } = b;
    		const m = addMeeple({ x, y });
    		return Boolean(m);
    	}
    	// Is too full?
    	const maxRes = buildingTypes[b.type].r / 2;
    	if (b.resources.length >= maxRes) return false;
    	b.resources = b.resources.concat([...arr]);
    	return true;
    }

    function produce(b, delta) {
    	const type = buildingTypes[b.type];
    	if (!type.output && !type.input) return;
    	const workers = Math.min(countWorkers(b), type.cap);
    	// Reduce cooldown by delta
    	// Adjust delta based on who's working at building
    	const mult = (workers) ? workers / (workers ** 0.55) : 0;
    	// console.log(workers, mult);
    	const workDelta = delta * mult;
    	b.prodCool -= workDelta;
    	if (b.prodCool > 0) return; // Still producing
    	// Production is done
    	b.prodCool = 0;
    	// Do we have input in inventory?
    	// if (!doesBuildingHave(b, type.input)) return;
    	const didConsumeAll = consumeResources(b, type.input);
    	if (!didConsumeAll) return;
    	const didCreate = createResources(b, type.output);
    	if (!didCreate) {
    		// If the creation failed then re-add the resources that were taken
    		createResources(b, type.input);
    		return;
    	}
    	resetProductionCooldown(b, b.prodCool);
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

    function simIdle(m, delta) {
    	if (m.path.length) {
    		// console.log(m.x, m.y, m.path, atPoint(m, m.path[0]));
    		if (atPoint(m, m.path[0])) m.path.shift();
    	}
    	if (!m.path.length) {
    		// TODO LATER: Do a momentary rest? If rested then continue
    		// Choose a new random destination and path
    		const bKey = randPick(g.buildingKeys);
    		console.log('Pick random building', bKey);
    		if (bKey === undefined) return;
    		m.path = getPathTo(g.buildings[bKey], m);
    		return;
    	}
    	// Move towards first spot of the path
    	moveTo(m, m.path[0], delta, IDLE_SPEED);
    }

    function simProd(m, delta) {
    	if (m.path.length) {
    		// console.log(m.x, m.y, m.path, atPoint(m, m.path[0]));
    		if (atPoint(m, m.path[0])) m.path.shift();
    	}
    	if (!m.path.length) {
    		if (isMeepleWorkingAt(m)) {
    			moveWorking(m, delta);
    			return;
    		}
    		const prodBKeys = g.buildingKeys.filter((key) => (
    			isBuildingProducing(g.buildings[key])
    		));
    		const bKey = randPick(prodBKeys);
    		console.log('Pick random production building', bKey);
    		if (bKey === undefined) return;
    		m.path = getPathTo(g.buildings[bKey], m);
    		return;
    	}
    	// Move towards first spot of the path
    	moveTo(m, m.path[0], delta, IDLE_SPEED);
    }

    function simulate(delta) { // Do updating of world
    	g.meepleKeys.forEach((key) => {
    		const m = g.meeples[key];
    		const simJob = {
    			idle: simIdle,
    			prod: simProd,
    			// TODO: Other jobs
    		};
    		if (simJob[m.job]) simJob[m.job](m, delta);
    	});
    	g.buildingKeys.forEach((k) => {
    		const b = g.buildings[k];
    		produce(b, delta);
    	});
    	// TODO: Enemies and combat
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
    	const type = buildingTypes[b.type];
    	return `<div class=b-name>${type.name || b.type}</div>
		<div>Resources: ${b.resources.join(', ')}</div>
		<div>Production: ${type.input.join(', ')} ➡️ ${type.output.join(', ')} ##%</div>
		Upgrades:`;
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
    	setHtml('#binfo', binfo);
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
    	});
    }

    function tapBottomUi(e) {
    	handleTap(e, {
    		'#play': startLoop,
    		'#pause': stopLoop,
    		'#build': () => g.creating = T,
    		'#cancel': () => g.creating = F,
    		'#restart': () => window.location.reload(),
    		'#jobs': () => {
    			g.assigning = !(g.assigning);
    			renderJobAssignment();
    		},
    	});
    }

    function setupDom() {
    	setHtml('#jass', `<ul>${JOBS.map((j, i) => (
		`<li id=jr-${j}><label for="input-${j}">${JOB_NAMES[i]}</label><b></b>
		<input id="input-${j}" type=range min=0></li>`
	)).join('')}</ul>`);
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
    			renderJobAssignment();
    			render();
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
    	setupDom();
    	setupEvents(g.world);
    	const b = addBuilding({ type: 'connector' });
    	addBuilding({ type: 'connector' }, b.key);
    	addMeeple();
    	addMeeple();
    	addMeeple();
    	render();
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
    	// test
    	getPathBetween,
    	doesBuildingHave,
    	consumeResources,
    	isMeepleWorkingAt,
    	countWorkers,
    	getPopMax,
    };
    document.addEventListener('DOMContentLoaded', g.start);

})();
