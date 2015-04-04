'use strict';

var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files'),
    plugins = require('gulp-load-plugins')(),
    q = require('q'),
    paths = require('path');

var exports = module.exports = function(config) {

    return {

        vendor: function() {
            plugins.util.log('Vendoring');
            var deferred = q.defer();

            gulp.src(mainBowerFiles())
                .pipe(plugins.filter(['*.js', '*.css', '*.css.map']))
                .pipe(gulp.dest(config.paths.buildDir + '/vendor'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        // Loads and ships all scripts to build folder
        scripts: function() {
            plugins.util.log('Building scripts');
            var deferred = q.defer(),
                appDir = config.paths.sourceDir + '/**/*.js';
            gulp
                .src([appDir])
                .pipe(plugins.plumber())
                .pipe(plugins.jshint())
                .pipe(plugins.jshint.reporter('default'))
                .pipe(gulp.dest(config.paths.buildDir + '/src'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);
            return deferred.promise;
        },

        styles: function() {
            plugins.util.log('Building styles');
            var deferred = q.defer(),
                componentDir = config.paths.sourceDir + '/components/**/',
                sassDir = config.paths.sourceDir + '/sass/**/*.scss',
                assetDir = config.paths.buildDir + '/assets';

            gulp
                .src([componentDir + '*.scss', componentDir + '*.css', sassDir])
                .pipe(plugins.sass({
                    errLogToConsole: true
                }))
                .pipe(gulp.dest(assetDir))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        imgs: function() {
            plugins.util.log('Copying images');
            var deferred = q.defer(),
                imgDir = config.paths.sourceDir + '/assets/img/**/*';

            gulp.src([imgDir])
                .pipe(plugins.plumber())
                .pipe(gulp.dest(config.paths.buildDir + '/assets/img'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log)

            return deferred.promise;
        },


        fonts: function() {
            plugins.util.log('Copying fonts');
            var deferred = q.defer(),
                fontDir = config.paths.sourceDir + '/assets/fonts/**/*';

            gulp.src([fontDir])
                .pipe(plugins.plumber())
                .pipe(gulp.dest(config.paths.buildDir + '/assets/fonts'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise
        },

        templates: function() {
            var def = q.defer();

            function adminTemplates() {
                plugins.util.log('Building admin templates');
                var deferred = q.defer(),
                    options = {
                        module: 'app.template',
                        standalone: true
                    };

                gulp
                    .src([config.paths.sourceDir + '/app/**/*.tpl.html', config.paths.sourceDir + '/common/**/*.tpl.html'])
                    .pipe(plugins.angularTemplatecache('app.tmpl.js', options))
                    .pipe(gulp.dest(config.paths.buildDir))
                    .on('end', deferred.resolve)
                    .on('error', plugins.util.log);
                return deferred.promise;
            }

            function componentTemplates() {
                plugins.util.log('Building component templates');
                var deferred = q.defer(),
                    options = {
                        module: 'components.templates',
                        standalone: true,
                    };

                gulp.src(config.paths.sourceDir + '/components/**/*.tpl.html')
                    .pipe(plugins.angularTemplatecache('components.tmpl.js', options))
                    .pipe(gulp.dest(config.paths.buildDir))
                    .on('end', deferred.resolve)
                    .on('error', plugins.util.log);
                return deferred.promise;
            }

            q.all([adminTemplates(), componentTemplates()]).then(def.resolve);

            return def.promise;
        },

        staticHtml: function(path) {
            var arr = [];
            mainBowerFiles().forEach(function(value) {
                arr.push('vendor/' + paths.basename(value));
            });
            return function() {
                var deferred = q.defer();
                var inject = function(glob, path, tag) {
                    return plugins.inject(
                        gulp.src(glob, {
                            cwd: path
                        }).pipe(plugins.plumber()), {
                            starttag: '<!-- inject:' + tag + ':{{ext}} -->',
                            addPrefix: '/public'
                        }
                    );
                };

                var injectAngular = function(glob, path, tag) {
                    return plugins.inject(
                        gulp.src(glob, {
                            cwd: path
                        }).pipe(plugins.plumber()).pipe(plugins.angularFilesort()), {
                            starttag: '<!-- inject:' + tag + ':{{ext}} -->',
                            addPrefix: '/public'
                        }
                    );
                };

                plugins.util.log('Rebuilding statics');

                gulp
                    .src('./index.html')
                    .pipe(plugins.plumber())
                    .pipe(inject(arr, path, 'vendor'))
                    .pipe(injectAngular('src/**/*.js', path, 'app'))
                    .pipe(inject('assets/**/*.css', path, 'assets'))
                    .pipe(inject('src/**/*.css', path, 'app'))
                    .pipe(inject('*.tmpl.js', path, 'templates'))
                    .pipe(gulp.dest(config.paths.buildDir))
                    .on('end', deferred.resolve)
                    .on('error', plugins.util.log);

                return deferred.promise;
            }
        },

        appConfig: function() {
            plugins.util.log('Creating config...');

            var deferred = q.defer();

            plugins.ngConstant({
                    constants: config.dev,
                    name: 'tuneInstallation.config',
                    stream: true
                })
                .pipe(gulp.dest(config.paths.buildDir + '/src/app'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        }

    };
};
