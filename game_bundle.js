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
    const MEEPLE_SIZE = 7;
    const BASE_DEF = 0.5;
    const DEF_DEF = 0.9;

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
    	const el = (typeof sel === 'object') ? sel : $(sel);
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
    const setVec = (o, v) => { o.x = v.x; o.y = v.y; return o; };
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
    		r: 20, cap: 6, cost: [W, W, S, S],
    		defMax: 1, popMax: 2,
    		classification: '🚩'
    	},
    	{
    		key: 'connector',
    		name: 'Crossroad',
    		r: 10, cap: 3, cost: [],
    		upgrades: ['stoneMine', 'grainFarm', 'tower', 'shrine', 'farmHouse', 'woodCutter', 'stockpile'],
    		classification: '🪧'
    	},
    	{
    		key: 'stockpile',
    		name: 'Stockpile',
    		r: 30, cap: 20, cost: [S, W, Gr],
    		upgrades: ['warehouse'],
    		classification: '📦',
    	},
    	{
    		key: 'warehouse',
    		name: 'Warehouse',
    		r: 42, cap: 40, cost: [S, S],
    		classification: '📦',
    	},
    	{
    		key: 'woodCutter',
    		name: 'Woodcutter',
    		r: 20, cap: 6, cost: [Gr],
    		input: [Gr], output: [W], rate: 4,
    		classification: '🪚',
    	},
    	{
    		key: 'stoneMine',
    		name: 'Stone Mine',
    		r: 20, cap: 6, cost: [W, W, W, Gr],
    		input: [Gr], output: [S], rate: 1.5,
    		upgrades: ['oreMine'],
    		classification: '🪚',
    	},
    	{
    		key: 'oreMine',
    		name: 'Ore Mine',
    		r: 30, cap: 6, cost: [W, S, Gr],
    		input: [W, Gr], output: [Or], rate: 1,
    		classification: '🪚',
    	},
    	{
    		key: 'tower',
    		name: 'Watchtower',
    		r: 14, cap: 2, cost: [S, W, W],
    		defMax: 5,
    		upgrades: ['fortress'],
    		classification: '🛡️',
    	},
    	{
    		key: 'fortress',
    		name: 'Fortress',
    		r: 24, cap: 4, cost: [S, S, S, W, Or],
    		defMax: 8,
    		classification: '🛡️',
    	},
    	{
    		key: 'grainFarm',
    		name: 'Grain farm',
    		r: 20, cap: 10, cost: [W, W],
    		input: [], output: [Gr], rate: 3,
    		upgrades: ['riceFarm'],
    		classification: '🪚',
    	},
    	{
    		key: 'riceFarm',
    		name: 'Rice farm',
    		r: 24, cap: 6, cost: [W, W, Or, Or],
    		input: [], output: [Ri], rate: 4,
    		classification: '🪚',
    	},
    	{
    		key: 'shrine',
    		name: 'Shrine',
    		r: 16, cap: 6, cost: [W, S, Or],
    		input: [Ri], output: [Ka], rate: 3,
    		upgrades: ['temple'],
    		classification: '🪷',
    	},
    	{
    		key: 'temple',
    		name: 'Temple',
    		r: 32, cap: 6, cost: [S, Or, Or, Ri],
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
    	return { x: randInt(g.world.size), y: randInt(g.world.size) };
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
    const loopMeeples = (fn) => loopThing(g.meepleKeys, g.meeples, fn);

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

    function addMeeple(mParam = {}) {
    	if (g.meepleKeys.length >= getPopMax()) {
    		// console.warn('Could not add another meeple');
    		return false;
    	}
    	const m = {
    		key: getRandomKey('M'),
    		job: 'idle',
    		hp: 100,
    		defense: BASE_DEF,
    		carry: N,
    		weapon: N,
    		buildingKey: N, // goal
    		path: [],
    		inv: [],
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
    	return JOB_KEYS.reduce((o, j) => ({ ...o, [j]: 0 }), {});
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
    	loopMeeples((m) => {
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
    	console.log('Meeples assigned jobs:', g.meeples, 'desired:', desiredJobCounts, 'final:', currJobCounts);
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
    	return T;
    }

    function upgradeBuilding(bKey, upTypeKey) {
    	const b = g.buildings[bKey];
    	const { upgrades = [] } = buildingTypes[b.type];
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

    function getWorldZoomSize() {
    	return g.world.size * g.zoom;
    }

    function renderCanvas(ctx) {
    	// ctx.fillStyle = 'green';
    	// ctx.fillRect(10, 10, 150, 100);
    }

    function setCirclePercent(circleSvgEl, r, percent = 0) {
    	const circumference = r * (2 * Math.PI);
    	const circPercent = percent * circumference;
    	const dashArray = [circPercent, circumference - circPercent];
    	setAttributes(circleSvgEl, {
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
    	setAttributes(group, {
    		id: b.key,
    		style: `transform: ${translateStyle(b)}`,
    	});
    	const prodCircle = createAppendSvg('circle', group);
    	setAttributes(prodCircle, {
    		// r: type.r + 4,
    		class: `b-prod-circle b-prod-${b.type}`,
    	});
    	setBuildingProgressSvg(b);
    	const circle = createAppendSvg('circle', group);
    	setAttributes(circle, {
    		// cx: b.x,
    		// cy: b.y,
    		r: type.r,
    		class: `building b-${b.type}`,
    	});
    	const resourceGroup = createAppendSvg('g', group);
    	setAttributes(resourceGroup, { class: 'b-res-g res-g' });
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
    	const group = createAppendSvg('g', layer);
    	setAttributes(group, {
    		id: m.key,
    		style: `transform: ${translateStyle(m)}`,
    		class: 'meeple-g',
    	});
    	const circle = createAppendSvg('circle', group);
    	// circle.id = m.key;
    	setAttributes(circle, {
    		// cx: 0, // m.x,
    		// cy: 0, // m.y,
    		r: MEEPLE_SIZE,
    		class: `meeple mj-${m.job}`,
    	});
    	const resourceGroup = createAppendSvg('g', group);
    	setAttributes(resourceGroup, { class: 'm-res-g res-g' });
    	return group;
    }

    function addResourceSvg(res, layer) {
    	const shape = createAppendSvg('circle', layer);
    	setAttributes(shape, {
    		r: 4,
    		class: `res res-${res}`,
    		'data-res': res,
    	});
    	return shape;
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
    		bEl.classList.toggle('selectedb', (b.key === g.selectedBuildingKey));
    		setBuildingProgressSvg(b);
    		renderResources(b.inv, bEl.querySelector('.res-g'), bt.r);
    	});
    }

    function renderSvg(layers) {
    	renderBuildings();
    	loopRoads((r) => {
    		let rEl = $id(r.key);
    		if (!rEl) rEl = addRoadSvg(r, layers.road);
    	});
    	loopMeeples((m) => {
    		let mEl = $id(m.key);
    		if (!mEl) mEl = addMeepleSvg(m, layers.meeple);
    		const circle = mEl.querySelector('.meeple');
    		circle.setAttribute('class', `meeple mj-${m.job}`);
    		mEl.style.transform = `translate(${m.x}px, ${m.y}px)`;
    		renderResources(m.inv, mEl.querySelector('.res-g'), MEEPLE_SIZE);
    	});
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

    function getBuildingInfoHtml(b) {
    	if (!b) return '';
    	const bt = buildingTypes[b.type];
    	// const upgradeButton = `<button id="b-up-toggle"><i>👁️🛠️</i><b>Toggle Upgrades (${bt.upgrades.length})</b></button>`;
    	// ${bt.upgrades.length ? upgradeButton : ''}
    	const toggleButtons = `<button ${(b.on) ? 'disabled="disabled"' : ' id="b-on"'}><i>🕯️</i><b>On</b></button>
		<button ${(b.on) ? 'id="b-off"' : 'disabled="disabled"'}><i>🚫</i><b>Off</b></button>`;
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
    	const html = `${g.meepleKeys.length} / max: ${getPopMax()}, Defenders max: ${getDefenderMax()}`;
    	setHtml('#mcounts', html);
    }

    function renderUi() {
    	const classes = $('main').classList;
    	classes.toggle('bselected', g.selectedBuildingKey);
    	classes.toggle('looping', g.looping);
    	classes.toggle('creating', g.creating);
    	classes.toggle('moving', g.moving);
    	classes.toggle('assigning', g.assigning);
    	classes.toggle('pop', g.meepleKeys.length > 0);
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
    	w.el.style.width = `${getWorldZoomSize()}px`;
    	w.el.style.height = w.el.style.width;
    	renderCanvas(w.ctx);
    	renderSvg(w.layers);
    	renderUi();
    }

    /* ------------------------------ Querying World ------------------ */

    function sumInv(inv) {
    	return inv.reduce((o, res) => ({ ...o, [res]: (o[res] || 0) + 1 }), {});
    }

    function getAllResourceCounts() {
    	const counts = {};
    	loopBuildings((b) => {
    		b.inv.forEach((res) => {
    			counts[res] = (counts[res] || 0) + 1;
    		});
    	});
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
    	return g.meepleKeys.reduce((sum, key) => (
    		sum + (isMeepleWorkingAt(g.meeples[key], b) ? 1 : 0)
    	), 0);
    }

    /** Does building have a list of resources? */
    function doesBuildingHave(b, arr = []) {
    	const leftOver = b.inv.reduce((left, res) => {
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

    /* ------------------------------ Looping ------------------ */

    /** Removes a list of resources from a building - all or nothing. Returns what's left to consume. */
    function consumeResources(b, arr = [], allOrNothing = F) {
    	if (!arr.length) return [];
    	if (allOrNothing && !doesBuildingHave(b, arr)) return [...arr];
    	return removeInvResources(b.inv, arr);
    }

    /** Make resources and add to a building  */
    function createResources(b, arr = []) {
    	// Special case: if output is a meeple, try to make a new person
    	if (arr.includes('meeple')) {
    		// TODO LATER: Allow multiple meeple to be created?
    		// TODO LATER: Allow meeple and other resources to be created at once?
    		const { x, y } = b;
    		const m = addMeeple({ x, y });
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
    		// Do we have input in inventory?
    		// if (!doesBuildingHave(b, type.input)) return;
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

    function setPathTo(m, bKeysParam) {
    	let bKeys = (typeof bKeysParam === 'string') ? [bKeysParam] : bKeysParam;
    	if (!bKeys.length) bKeys = g.buildingKeys;
    	const bKey = randPick(bKeys);
    	// console.log('Pick random building', bKey);
    	if (bKey === undefined) return;
    	m.path = getPathTo(g.buildings[bKey], m);
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
    	checkArrivalTrimPath(m);
    	if (!m.path.length) {
    		// TODO LATER: Do a momentary rest? If rested then continue
    		// Choose a new random destination and path
    		setPathTo(m, g.buildingKeys);
    		return;
    	}
    	// Move towards first spot of the path
    	moveTo(m, m.path[0], delta, IDLE_SPEED);
    }

    function simProd(m, delta) {
    	checkArrivalTrimPath(m);
    	if (!m.path.length) {
    		if (isMeepleWorkingAt(m)) {
    			moveWorking(m, delta);
    			return;
    		}
    		const prodBKeys = filterBuildingKeys((b, bt) => (
    			isBuildingProducing(b) && bt.classification === '🪚'
    		));
    		setPathTo(m, prodBKeys);
    		return;
    	}
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
    		setPathTo(m, bKeys);
    		return;
    	}
    	const speed = CARR_SPEED * (m.inv.length ? ENCUMBER : 1);
    	// Move towards first spot of the path
    	moveTo(m, m.path[0], delta, speed);
    }

    function simDefend(m, delta) {
    	checkArrivalTrimPath(m);
    	// TODO: If near enemy then handle combat
    	if (!m.path.length) {
    		// TODO: If on a defense place then increase defense score
    		m.defense = Math.min(m.defense + 0.05, DEF_DEF);
    		// TODO: If combat, then move toward enemy
    		// Patrol between defense
    		const defBKeys = filterBuildingKeys((b, bt) => (bt.classification === '🛡️'));
    		setPathTo(m, defBKeys);
    		return;
    	}
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
    		setPathTo(m, bKeys);
    		return;
    	}
    	// Move towards first spot of the path
    	moveTo(m, m.path[0], delta, MEEP_SPEED);
    }

    function simInvader(m, delta) {
    	// TODO: Enemies and combat
    }

    function simulate(delta) { // Do updating of world
    	g.meepleKeys.forEach((key) => {
    		const m = g.meeples[key];
    		const simJob = {
    			idle: simIdle,
    			prod: simProd,
    			carr: simCarrier,
    			defe: simDefend,
    			spir: simSpirit,
    		};
    		if (simJob[m.job]) simJob[m.job](m, delta);
    	});
    	g.buildingKeys.forEach((k) => {
    		const b = g.buildings[k];
    		produce(b, delta);
    	});
    	g.invaderKeys.forEach((key) => {
    		simInvader(g.invaders[key]);
    	});
    }

    function invade(n) {
    	// TODO: spawn invaders
    }

    function loop() {
    	if (!g.looping) return;
    	const now = Number(new Date());
    	const delta = (g.lastTime) ? now - g.lastTime : 0;
    	g.lastTime = now;
    	if (!g.peace) {
    		g.countdown -= delta;
    		if (g.countdown <= 0) {
    			invade(g.meeples.length - 1);
    		}
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
    		// '#b-up-toggle': () => g.upgradesOpen = !g.upgradesOpen,
    		'#kamikaze': () => {
    			stopLoop();
    			if (g.karma < WIND_KARMA) return;
    			g.karma -= WIND_KARMA;
    			g.countdown = 300000;
    			g.kamikazes += 1;
    			window.alert('A divine wind washes away the invading fleet!');
    			if (g.kamikazes >= 2) {
    				g.peace = T;
    				window.alert('You win');
    			}
    		},
    	});
    }

    function tapBottomUi(e) {
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
    	});
    }

    function setupDom() {
    	setHtml('#jass', `<div>Loyal to your Hōjō clan: <span id="mcounts"></span>
		<br><span class="altname">Build houses or towers to increase capacity.</span></div>
		<ul>${JOB_KEYS.map((j, i) => {
		const job = JOBS_OBJ[j];
		return `<li id=jr-${j}><label for="input-${j}">${job.name} <span class="altname">(${job.altName})</span> ${job.classification}</label><b><span class=jr-num></span></b>
		<input id="input-${j}" type=range min=0></li>`
	}).join('')}</ul>`);
    	renderMeepleCounts();
    }

    function setupEvents(w) {
    	const { el } = w;
    	/*
    	// Requires that the element has draggable true
    	setAttributes(el, { draggable: 'true' });
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
    	on(el, 'pointerup', (e) => {
    		// console.log('world pointerup');
    		pickupEvent = N;
    		g.moving = F;
    		render();
    	});
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
    	on($('#bui'), 'pointerdown', tapBottomUi);
    	on($('#tui'), 'pointerdown', tapTopUi);
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
    	const size = Math.max(window.innerHeight, window.innerWidth);
    	const c = $('#wc');
    	setAttributes(c, { width: size, height: size });
    	const el = $('#w');
    	const svg = $('#ws');
    	setAttributes(svg, { viewBox: `0 0 ${size} ${size}`});
    	g.world = {
    		c,
    		el,
    		svg,
    		size,
    		ctx: c.getContext('2d'),
    		layers: {
    			road: $('#layer-road'),
    			building: $('#layer-building'),
    			resource: $('#layer-resource'),
    			meeple: $('#layer-meeple'),
    		},
    		x: window.innerWidth - size,
    		y: 0,
    	};
    	setupDom();
    	setupEvents(g.world);
    	const x = size - 40;
    	const y = size / 2;
    	const b = addBuilding({ type: 'outpost', x, y });
    	b.inv = [W, W];
    	addBuilding({ type: 'connector', x: x - (100 + randInt(size/3)), y: y + randInt(200) - randInt(200) }, b.key);
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
    	invaders: {},
    	invaderKeys: [],
    	selectedBuildingKey: N,
    	upgradesOpen: F,
    	countdownEl: N,
    	peace: F,
    	kamikazes: 0,
    	lastTime: 0,
    	karma: 0,
    	countdown: 600000, // 10 minutes * 60 seconds/min * 1000 ms/sec
    	looping: F,
    	moving: F,
    	creating: F,
    	assigning: F,
    	zoom: 1,
    	start,
    	// test
    };
    document.addEventListener('DOMContentLoaded', g.start);

})();
