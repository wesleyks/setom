/* jshint mocha: true */
"use strict";
var expect = require("chai").expect,
	setom = require("../setom");

describe("Setom Tests", function() {
	var fML = setom.parse;

	it("should parse basic elements", function() {
		expect(fML("(a)")).to.equal("<a></a>");
		expect(fML("(a b)")).to.equal("<a>b</a>");
		expect(fML("(a (b))")).to.equal("<a><b></b></a>");
		expect(fML("(a (b c))")).to.equal("<a><b>c</b></a>");
	});

	it("should parse elements with declared attributes", function() {
		expect(fML("(a :b c)")).to.equal("<a b='c'></a>");
		expect(fML("(a :b c (d))")).to.equal("<a b='c'><d></d></a>");
		expect(fML("(a (b) :c d)")).to.equal("<a c='d'><b></b></a>");
	});

	it("should parse escaped single and double quotes", function() {
		expect(fML("(a '(')")).to.equal("<a>(</a>");
		expect(fML("(a \"(\")")).to.equal("<a>(</a>");
		expect(fML("(a 'b c')")).to.equal("<a>b c</a>");
		expect(fML("(a (b 'c d'))")).to.equal("<a><b>c d</b></a>");
		expect(fML("(a 'b c' ' d')")).to.equal("<a>b c d</a>" );
	});

	it("should parse complex expressions", function() {
		expect(fML("(a 'b' (c d :e 'f g' h :i j) 'k l')"))
			.to.equal("<a>b<c e='f g' i='j'>dh</c>k l</a>");
	});

	// Commenting this out, I didn't intend for this functionality,
	// not for now at least.
	// it("should parse multiple top-level expressions", function() {
	// 	expect(fML("(a) (b)")).to.equal("<a></a><b></b>");
	// });

	it("should throw an error for unbalanced parentheses", function() {
		expect(fML.bind(fML, "(()")).to.throw(/unbalanced/i);
	});

	it("should throw an error for invalid tag constructor", function() {
		expect(fML.bind(fML, "()")).to.throw(/tag constructor/);
	});
});
