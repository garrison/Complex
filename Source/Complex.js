/*
---
name: Complex
description: Provides a way to use Complex Numbers in JavaScript

license: MIT-style
author: Arian Stolwijk

requires: [Core/Core, Core/Number]
provides: Complex

...
*/

(function(){

var implementMethodIntoNumber = function(name){

	var dontMirror = ['toString', 'fromPolar', 'fromRect', 'toPrecision', 'toFixed'];
	if (dontMirror.indexOf(name) == -1) Number.implement(name, function(){
		var ret = new Complex(this);
		ret = ret[name].apply(ret, arguments);
		return (Type.isComplex(ret) && !ret.im) ? ret.real : ret;
	});
	return implementMethodIntoNumber;

};

var Complex = this.Complex = new Type('Complex', function(real, im){

	var type = typeOf(real),
		args = [real, im];

	if (type == 'complex') args = [real.real, real.im];
	else if (type == 'string'){
		if (real == 'i') real = '0+1i';
		var match = real.match(/(\d+)?([\+-]\d*)[ij]/);
		if (match) args = [match[1], (match[2] == '+' || match[2] == '-') ? match[2] + '1' : match[2]];
	}

	this.real = +args[0] || 0;
	this.im = +args[1] || 0;

}).mirror(implementMethodIntoNumber).implement({

	fromPolar: function(r, phi){
		if (typeOf(r) == 'string'){
			var parts = r.split(' ');
			r = parts[0];
			phi = parts[1];
		}
		this.real = r * Math.cos(phi);
		this.im = r * Math.sin(phi);
		return this;
	},

	fromRect: function(a, b){
		this.real = a;
		this.im = b;
		return this;
	},

	toPrecision: function(k){
		return this.fromRect(
			this.real.toPrecision(k),
			this.im.toPrecision(k)
		);
	},

	toFixed: function(k){
		return this.fromRect(
			this.real.toFixed(k),
			this.im.toFixed(k)
		);
	},

	magnitude: function(){
		return Math.sqrt(this.real * this.real + this.im * this.im);
	},

	angle: function(){
		return Math.atan(this.im / this.real);
	},

	conjungate: function(){
		this.im = -this.im;
		return this;
	},

	negate: function(){
		this.im = -this.im;
		this.real = -this.real;
		return this;
	},

	multiply: function(number){
		number = Complex.from(number);
		return this.fromRect(
			number.real * this.real - number.im * this.im,
			this.im * number.real + number.im * this.real
		);
	},

	devide: function(number){
		number = Complex.from(number);
		var devider = (Math.pow(number.real, 2) + Math.pow(number.im, 2));
		return this.fromRect(
			(this.real * number.real + this.im * number.im) / devider,
			(this.im * number.real - this.real * number.im) / devider
		);
	},

	add: function(number){
		number = Complex.from(number);
		this.real += number.real;
		this.im += number.im;
		return this;
	},

	subtract: function(number){
		this.add(Complex.from(number).multiply(-1));
		return this;
	},

	pow: function(n){
		n = Complex.from(n);
		var result = n.multiply(this.clone().log()).exp(); // z^w = e^(w*log(z))
		return this.fromRect(result.real, result.im);
	},

	sqrt: function(){
		var abs = this.magnitude(),
			sgn = this.im < 0 ? -1 : 1;
		return this.fromRect(
			Math.sqrt((abs + this.real) / 2),
			sgn * Math.sqrt((abs - this.real) / 2)
		);
	},

	log: function(k){
		if (!k) k = 0;
		return this.fromRect(
			Math.log(this.magnitude()),
			this.angle() + k * 2 * Math.PI
		);
	},

	exp: function(){
		return this.fromPolar(
			Math.exp(this.real),
			this.im
		);
	},

	sin: function(){
		var a = this.real, b = this.im;
		return this.fromRect(
			Math.sin(a) * Math.cosh(b),
			Math.cos(a) * Math.sinh(b)
		);
	},

	cos: function(){
		var a = this.real, b = this.im;
		return this.fromRect(
			Math.cos(a) * Math.cosh(b),
			Math.sin(a) * Math.sinh(b) * -1
		);
	},

	tan: function(){
		var a = this.real, b = this.im,
			divident = Math.cos(2 * a) + Math.cosh(2 * b);
		return this.fromRect(
			Math.sin(2 * a) / divident,
			Math.sinh(2 * b) / divident
		);
	},

	sinh: function(){
		var a = this.real, b = this.im;
		return this.fromRect(
			Math.sinh(a) * Math.cos(b),
			Math.cosh(a) * Math.sin(b)
		);
	},

	cosh: function(){
		var a = this.real, b = this.im;
		return this.fromRect(
			Math.cosh(a) * Math.cos(b),
			Math.sinh(a) * Math.sin(b)
		);
	},

	tanh: function(){
		var a = this.real, b = this.im,
			divident = Math.cosh(2 * a) + Math.cos(2 * b);
		return this.fromRect(
			Math.sinh(2 * a) / divident,
			Math.sin(2 * b) / divident
		);
	},

	clone: function(){
		return new Complex(this.real, this.im);
	},

	toString: function(polar){
		if (polar) return this.magnitude() + ' ' + this.angle();

		var ret = '';
		if (this.real) ret += this.real;
		if (this.real && this.im || this.im < 0) ret += this.im < 0 ? '-' : '+';
		if (this.im){
			var absIm = Math.abs(this.im);
			if (absIm != 1) ret += absIm;
			ret += 'i';
		}
		return ret || '0';
	},

	equals: function(z){
		z = new Complex(z);
		return (z.real == this.real && z.im == this.im);
	}

}).alias({
	abs: 'magnitude',
	arg: 'angle',
	phase: 'angle',
	conj: 'conjungate',
	mult: 'multiply',
	dev: 'devide',
	sub: 'subtract'
});

Complex.extend({

	from: function(a, b){
		return new Complex(a, b);
	},

	fromPolar: function(r, phi){
		return new Complex(1, 1).fromPolar(r, phi);
	},

	i: new Complex(0, 1),

	one: new Complex(1, 0)

});


Number.implement('toComplex', function(){
	return new Complex(this, 0);
});

Math.sinh = function(x){
	return (Math.pow(Math.E, x) - Math.pow(Math.E, -x)) / 2;
};

Math.cosh = function(x){
	return (Math.pow(Math.E, x) + Math.pow(Math.E, -x)) / 2;
};

Math.tanh = function(x){
	return (Math.pow(Math.E, 2 * x) - 1) / (Math.pow(Math.E, 2 * x) + 1);
};


// Overwrite Number from to get the real part of complex numbers
var from = Number.from;
Number.from = function(number){
	return (instanceOf(number, Complex)) ? number.real : from(number);
};


// Implement a toComplex function for strings
String.implement('toComplex', function(){
	return new Complex(this);
});

})();
