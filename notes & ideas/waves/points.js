function waveform() {
	// global curve definition
	this.a_major = 1;
	this.a_minor = 1/4;
	this.w = 1;
	this.scale = 50;
	this.x_origin = 0;
	this.y_origin = 400;
	this.start = 0;
	this.end = 29;
	this.offset = 0;
	this.t_incr = Math.PI / (2 * this.w);

	// declare member functions
	this.initializeWaveRange = initializeWaveRange;
	this.x = x;
	this.y = y;
	this.getPoint = getPoint;
	this.logistic = logistic;
	this.getSegments = getSegments;

	// load initial path
	this.path = this.initializeWaveRange(this.a_major, this.a_minor, this.w, this.scale,
							 this.x_origin, this.y_origin, this.start, this.end, this.offset);
	// returns the current path stored in this waveform
	function getSegments() {
		return this.path;
	}

	// returns a list of 2-element lists (points) on the curve
	function initializeWaveRange() {
		var pts = [];
		var t;
		for (t = this.start ; t <= this.end + 3 * this.t_incr; t += this.t_incr) {
			//var logScalar = logistic(t, 1/4, this.a_major);
			pts.push(getPoint(t, this.a_major, this.a_minor, this.w, this.scale,
							  this.x_origin, this.y_origin, this.offset));
		}
		this.next_t = t;
		return pts;
	}

	// parametic components to the curve
	function x(t, a_major, a_minor, w, offset) {
		return t -  a_minor * Math.cos(t + offset) * Math.sin(w * (t + offset))
												* logistic(t, 1/20, 1);
	}
	function y(t, a_major, a_minor, w, offset) {
		return a_major * (Math.sin(t + offset) * logistic(t, 1/20, 10)
										+ a_minor * Math.sin(w * (t + offset)));
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
		//return 1;
		return max * (1.0 / (1 + Math.exp(-decay * t))) *
				 (1.0 / (1 + Math.exp(decay * t)))
	}
}