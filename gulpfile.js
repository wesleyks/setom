"use strict";

var gulp = require("gulp"),
	jshint = require("gulp-jshint"),
	jscs = require("gulp-jscs"),
	mocha = require("gulp-mocha");

gulp.task("lint", function() {
	return gulp.src([ "setom.js", "gulpfile.js", "test/*.js" ])
		.pipe(jshint())
		.pipe(jshint.reporter("default"))
		.pipe(jscs());
});

gulp.task("test", function() {
	return gulp.src("test/*.js")
		.pipe(mocha({
			reporter: "nyan"
		}));
});

gulp.task("default", [ "lint", "test" ]);
