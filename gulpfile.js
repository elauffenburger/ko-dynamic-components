var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	requirejsOptimize = require('gulp-requirejs-optimize'),
	exec = require('gulp-exec'),
	del = require('del');

gulp.task('minify', ["clean"], minify);
gulp.task('optimize', ["clean"], optimize);
gulp.task('clean', clean);
gulp.task('documentation', ["optimize"], documentation);

gulp.task('default', ["clean", "optimize", "documentation"]);

function documentation(done) {
	del([
		"./documentation/**/*",
		"./node_modules/ink-docstrap/template/jsdoc.conf.json"
	], function () {		
		// Generate documentation
		gulp.src('./src/*.js')
			.pipe(exec('jsdoc -r ./src/ -d ./documentation -t ./node_modules/ink-docstrap/template -c jsdoc.conf.json'))
			.on('end', function () {
				done();
			});
	});
}

function clean(done) {
	del([
		"./dist/**/*"
	], done);
}

function minify(done) {
	gulp.src('./src/*.js')
		.pipe(gulp.dest("./dist/"))
		.pipe(uglify())
		.pipe(rename(function (path) {

	}))
		.pipe(gulp.dest('./dist/min/'))
		.on('end', function () {
		done();
	});
}

function optimize(done) {
	function getRequireOptions() {
		return {
			paths: {
				"jquery": "../bower_components/jquery/dist/jquery.min",
				"knockout": "../bower_components/knockout/dist/knockout",
			},
			optimize: "none",
			include: [
				"kdc-base",
				"kdc-util",
				"ko-dynamic-components"
			]
		};
	}

	var src = "./src/ko-dynamic-components.js";

	gulp.src(src)
		.pipe(requirejsOptimize(
		getRequireOptions()
		))
		.pipe(gulp.dest('./dist'))
		.on('end', function () {
		gulp.src(src)
			.pipe(requirejsOptimize(function (file) {
			var rjsOptions = getRequireOptions();
			rjsOptions.optimize = "uglify";

			return rjsOptions;
		}))
			.pipe(rename(function (file) {
			file.extname = '.min.js';
		}))
			.pipe(gulp.dest('./dist'))
			.on('end', function () {
			done();
		});
	});
}