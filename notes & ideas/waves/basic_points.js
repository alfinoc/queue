var W;
var DECAY;
var VERT_OFFSET;
var SCALE;

function initialPoints() {
	for (var i = 0; i < end; i++)
		[VERT_OFFSET + SCALE * MATH.sin(i)]
}

// gets a point on the curve defined by x() and y() at 't' with inner amplitude
// and wavelength 'a' and 'w', scaled to 'scale', offset by 'x_origin' and 'y_origin'
function getPoint(t, a_major, a_minor, w, scale, x_origin, y_origin, offset) {
	return [scale * x(t, a_major, a_minor, w, offset) + x_origin, scale * y(t, a_major, a_minor, w, offset) + y_origin];
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