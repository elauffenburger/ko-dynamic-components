var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	rename = require('gulp-rename');
	
gulp.task('default', defaultTask);

function defaultTask() {
	gulp.src('./src/knockout-dynamic-components.js')
		.pipe(gulp.dest('./dist'))
		.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(rename('knockout-dynamic-components.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist'));
}