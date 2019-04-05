import {vec3, vec2, mat2, mat3, quat} from 'gl-matrix';
import {gl} from './globals';

export function rng(x: vec3) {
  	let n: number = x[0] * 137 + x[1] * 122237 + x[2] * 13;
 	var result = Math.abs(Math.sin(n) * 43758.5453123) - Math.floor(Math.abs(Math.sin(n) * 43758.5453123));
 	x[0] ++;
 	return result;
}

export function random1(p: vec2, seed: vec2) {
	var add = vec2.fromValues(0, 0);
	vec2.add(add, p, seed);

	var dot = vec2.dot(add, vec2.fromValues(127.1, 311.7));
	var angle = Math.sin(dot) * 600.0;
	var fract = angle - Math.floor(angle);
	return fract;
}

export function mix(x: number, y: number, a: number) {
	return x * (1.0 - a) + y * a;
}

export function noise(st: vec2) {
	var i = vec2.fromValues(Math.floor(st[0]),
							Math.floor(st[1]));
	var f = vec2.fromValues(st[0] - i[0],
							st[1] - i[1]);
	var seed = vec2.fromValues(7.0, 9.0);

	var a = random1(i, seed);
	var b = random1(vec2.fromValues(i[0] + 1.0, i[1]), seed);
    var c = random1(vec2.fromValues(i[0], i[1] + 1.0), seed);
    var d = random1(vec2.fromValues(i[0] + 1.0, i[1] + 1.0), seed);

    var u = vec2.fromValues(f[0] * f[0] * (3.0 - 2.0 * f[0]),
    						f[1] * f[1] * (3.0 - 2.0 * f[1]));
    return mix(a, b, u[0]) +
    		(c - a) * u[1] * (1.0 - u[0]) + (d - b) * u[0] * u[1];
}

export function fbm(p: vec2) {
	var value = 0.0;
	var amplitude = .5;
	var frequency = 0.;

	var shift = vec2.fromValues(100.0, 100.0);
	var rot = mat2.fromValues(Math.cos(0.5), -Math.sin(0.5),
							  Math.sin(0.5), Math.cos(0.5));
	let point: vec2 = vec2.fromValues(p[0], p[1]);
	for (var i = 0.0; i < 5.0; i++) {
		value += amplitude * noise(point);
		vec2.transformMat2(point, point, rot);
		point[0] = point[0] * 2.5 + shift[0];
		point[1] = point[1] * 2.5 + shift[1];
		amplitude *= .5;
	}
	return value;
}

export function heightView(standardized: vec2) {

	var fbm_Col = fbm(vec2.fromValues(standardized[0] * 0.015,
									  standardized[1] * 0.015));
	if (fbm_Col < 0.55) {
		return 0.0;
	}
	else {
		let n: number = (fbm_Col - 0.5) * 2.0;
		let p: vec2 = vec2.fromValues(n, n);
		let f: number = 1.2 + (fbm(p) * -1.0);
		return f;
	}
}

export function populationView(standardized: vec2) {
	var terrain = heightView(standardized);
	if (terrain <= 0.0) {
		return terrain;
	}
	else {
		let point: vec2 = vec2.fromValues((standardized[0] + 10.0) * 8.0 + 6.0,
										  (standardized[1] + 10.0) * 8.0 + 6.0);
		var result = fbm(vec2.fromValues(point[0] * 0.015,
								   point[1] * 0.015));
		return result * result;
	}
}

export class Grid {
	seed: vec3; 
	n: number;
	x: Array<number> = new Array();
	z: Array<number> = new Array();


	isWater(point: vec2) {
		var h = heightView(point);
		if (h == 0.0) {
			return true;
		}
		else {
			return false;
		}
	}

	height(point: vec2) {
		return heightView(point);
	}

	population(point: vec2) {
		return populationView(point);
	}

	isRoad(point: vec2) {
		if (this.x.indexOf(point[0]) > -1) {
			return true;
		}
		else if (this.z.indexOf(point[1]) > -1) {
			return true;
		}
		else {
			return false;
		}
	}

	isTree(standardized: vec2) {
		var terrain = heightView(standardized);
		if (terrain == 0.0) {
			return false;
		}
		if (terrain == -1) {
			return false;
		}
		else {
			let point: vec2 = vec2.fromValues((standardized[0] + 10.0) * 8.0 + 6.0,
											  (standardized[1] + 10.0) * 8.0 + 6.0);
			var result = fbm(vec2.fromValues(point[0] * 0.2,
									   point[1] * 0.2));
			var final = result * result;
			if (final > 0.35) {
				return true;
			}
			else {
				return false;
			}
		}
	}

	isBuilding(standardized: vec2) {
		var terrain = heightView(standardized);
		if (terrain == 0.0) {
			return false;
		}
		if (terrain == -1) {
			return false;
		}
		else {
			let point: vec2 = vec2.fromValues((standardized[0] + 10.0) * 8.0 + 6.0,
											  (standardized[1] + 10.0) * 8.0 + 6.0);
			var result = fbm(vec2.fromValues(point[0] * 0.1,
									   point[1] * 0.1));
			var final = result * result;
			if (final > 0.3) {
				return true;
			}
			else {
				return false;
			}
		}
	}

	constructRoad() {
		var s = this.seed;
		for (var i = -this.n/2; i < this.n/2; i++) {
			if (i % 6 == 0) {
				var noise = rng(s) * 5;
				var pos = Math.floor(i + noise);
				console.log(pos);
				this.x.push(pos);
			}
			if (i % 6 == 0) {
				var noise = rng(s) * 4;
				var pos = Math.floor(i + noise); 
				this.z.push(pos);
			}
		}
		//console.log(this.x.indexOf(2) > -1);
	}

	constructor(seed: vec3, n: number) {
		this.seed = seed;
		this.n = n;
		this.constructRoad();
	}

}