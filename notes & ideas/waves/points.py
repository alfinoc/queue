from math import sin, cos, pi

def x(t, a, w):
	return t - a * cos(t) * sin(w * t)

def y(t, a, w):
	return sin(t) + a * sin(w * t)

def f(t, a, w, scale, origin):
	return (scale * x(t, a, w) + origin, scale * y(t, a, w) + origin)

def to_js(pair):
	return "[" + str(pair[0]) + "," + str(pair[1]) + "],"

# max/min of inner wave at t = (npi)/(2w) for odd n, intersection with outer
# wave at even n
a = 1.0 / 10
w = 25
incr = pi / (2 * w)
#pi = math.pi

for n in range(-100, 100):
	t = n * incr
	print to_js(f(t, a, w, 200, 450))