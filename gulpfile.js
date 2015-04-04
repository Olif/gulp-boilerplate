'use strict';

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    q = require('q'),
    paths = require('path'),
    config = require('./config.json'),
    common = require('./gulp-tasks/common.js'),
    dev = require('./gulp-tasks/dev.js')(config),
    release = require('./gulp-tasks/release.js')(config);

gulp.task('default', function() {
    common.clean('./build')
        .then(dev.vendor)
        .then(dev.scripts)
        .then(dev.styles)
        .then(dev.templates)
        .then(dev.fonts)
        .then(dev.imgs)
        .then(dev.appConfig)
        .then(dev.staticHtml(paths.join(__dirname, config.paths.buildDir)))
        .then(function() {
            plugins.util.log(plugins.util.colors.red('Started watching...'))
        });

    gulp.watch(config.paths.sourceDir + '/**/*.js', function() {
        common.clean('/src').then(dev.scripts).then(dev.staticHtml(__dirname + '/build'));
    });

    gulp.watch(config.paths.sourceDir + '/**/*.scss', function() {
        common.clean('/assets').then(dev.styles).then(dev.fonts).then(dev.imgs).then(dev.staticHtml(__dirname + '/build'));
    });

    gulp.watch(config.paths.sourceDir + '/**/*.tpl.html', function() {
        dev.templates().then(dev.staticHtml(__dirname + '/build'));
    });

    gulp.watch('./config.json', function() {
        dev.appConfig();
    });

});

gulp.task('clean', function() {
    common.clean('./bin');
    common.clean('./build');
});

gulp.task('compile', function() {
    common.clean('./bin')
        .then(q.all([release.compileJs(),
                release.compileCss(),
                release.compileVendorCss(),
                release.compileVendorJs(),
                release.compileImgs(),
                release.compileTemplates(),
                release.compileFonts(),
                release.compileConfig()
            ])
            .then(release.compileIndex(paths.join(__dirname, config.paths.compileDir)))
            .then(function() {
                console.log('Finished compile');
            }));
});
