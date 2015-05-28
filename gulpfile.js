var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	requirejsOptimize = require('gulp-requirejs-optimize'),
	del = require('del');

gulp.task('minify', minify);
gulp.task('optimize', optimize);
gulp.task('clean', clean);

gulp.task('default', ["clean", "minify"]);

function clean(done) {
	del([
		"./dist/**/*"
	], done);
}

function minify(done) {
	gulp.src('./src/*.js')
		.pipe(gulp.dest("./dist/"))
		.pipe(uglify())
		.pipe(rename(function(path) {
			
		}))
		.pipe(gulp.dest('./dist/min/'))
		.on('end', function() {
			done();
		});
}

function optimize(done) {
	gulp.src("./src/*.js")
		.pipe(requirejsOptimize(
			{
				paths: {
					"jquery": "../bower_components/jquery/dist/jquery.min",
					"knockout": "../bower_components/knockout/dist/knockout"
				},
				optimize: "none"
			}
		))
		.pipe(gulp.dest('./dist'))
		.on('end', function() {
			done();
		});
}