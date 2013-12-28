	var newPointCounter = 0;
	function step(hor_disp) {
		// insert new point if we need one
		if (this.path[1][0] - hor_disp < 0) {
			stableWave = logistic(this.next_t, 1/20, 10) < 0.01;

			this.path.shift();
			//var logScalar = logistic(this.next_t, 1/4, this.a_major);
			this.path.push(getPoint(this.next_t, this.a_major, this.a_minor, this.w, this.scale,
							this.x_origin, this.y_origin, this.offset));
			this.path[this.path.length - 1][0] -= newPointCounter * hor_disp;
			this.next_t += this.t_incr;
		}	
		newPointCounter++;

		// shift everything left
		for (var i = 0; i < this.path.length; i++) {
			this.path[i][0] -= hor_disp;
		}
	}

// Gets a list of 2-element lists (points) on the curve
function getWaveRange(a_major, a_minor, w, scale, x_origin, y_origin, start, end, offset) {
	var pts = [];
	incr = Math.PI / (2 * w);
	for (var t = start; t <= end; t += incr) {
		var logScalar = logistic(t, 1/4, a_major);
		pts.push(getPoint(t, logScalar, a_minor, w, scale, x_origin, y_origin, offset));
	}
	return pts;
}

// parametic components to the curve
function x(t, a_major, a_minor, w, offset) {
	return t -  a_minor * Math.cos(t + offset) * Math.sin(w * (t + offset)) /** logistic(t, 1/5, 10) */;
}
function y(t, a_major, a_minor, w, offset) {
	return a_major * Math.sin(t + offset) + a_minor * Math.sin(w * (t + offset))
}

// gets a point on the curve defined by x() and y() at 't' with inner amplitude
// and wavelength 'a' and 'w', scaled to 'scale', offset by 'x_origin' and 'y_origin'
function getPoint(t, a_major, a_minor, w, scale, x_origin, y_origin, offset) {
	return [scale * x(t, a_major, a_minor, w, offset) + x_origin, scale * y(t, a_major, a_minor, w, offset) + y_origin];
}

// max: maximum value (at t = 0), scaling curve up
// decay: decay factor (larger decay -> goes to 0 faster)
// t: input variable
function logistic(t, decay, max) {
	return max * (1.0 / (1 + Math.exp(-decay * t))) *
				 (1.0 / (1 + Math.exp(decay * t)))
}