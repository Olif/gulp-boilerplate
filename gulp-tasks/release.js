var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files'),
    plugins = require('gulp-load-plugins')(),
    q = require('q'),
    paths = require('path'),
    common = require('./common');

var exports = module.exports = function(config) {

    return {

        compileVendorCss: function() {
            plugins.util.log('Compiling vendor css');
            var deferred = q.defer();

            gulp.src(mainBowerFiles())
                .pipe(plugins.filter(['*.css']))
                .pipe(plugins.concat('vendor.min.css'))
                .pipe(plugins.bytediff.start())
                .pipe(plugins.minifyCss())
                .pipe(plugins.bytediff.stop(common.bytediffFormatter))
                .pipe(gulp.dest(config.paths.compileDir + '/assets'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        compileVendorJs: function() {
            plugins.util.log('Compiling vendor js');
            var deferred = q.defer();

            gulp.src(mainBowerFiles())
                .pipe(plugins.filter(['*.js']))
                .pipe(plugins.concat('vendor.min.js'))
                .pipe(plugins.bytediff.start())
                .pipe(plugins.uglify())
                .pipe(plugins.bytediff.stop(common.bytediffFormatter))
                .pipe(gulp.dest(config.paths.compileDir + '/assets'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        compileCss: function() {
            plugins.util.log('Compiling app css');

            var deferred = q.defer(),
                componentDir = config.paths.sourceDir + '/components/**/',
                sassDir = config.paths.sourceDir + '/sass/**/*.scss';
            gulp
                .src([componentDir + '*.scss', componentDir + '*.css', sassDir])
                .pipe(plugins.sass({
                    errLogToConsole: true
                }))
                .pipe(plugins.concat('app.min.css'))
                .pipe(plugins.bytediff.start())
                .pipe(plugins.minifyCss())
                .pipe(plugins.bytediff.stop(common.bytediffFormatter))
                .pipe(gulp.dest(config.paths.compileDir + '/assets'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        compileJs: function() {
            plugins.util.log('Compiling app scripts');

            var deferred = q.defer(),
                appDir = config.paths.sourceDir + '/**/*.js';

            gulp
                .src([appDir])
                .pipe(plugins.plumber())
                .pipe(plugins.jshint())
                .pipe(plugins.jshint.reporter('default'))
                .pipe(plugins.angularFilesort())
                .pipe(plugins.concat('app.min.js'))
                .pipe(plugins.bytediff.start())
                .pipe(plugins.uglify())
                .pipe(plugins.bytediff.stop(common.bytediffFormatter))
                .pipe(gulp.dest(config.paths.compileDir + '/assets'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        compileImgs: function() {
            plugins.util.log('Copying images');
            var deferred = q.defer(),
                imgDir = config.paths.sourceDir + '/assets/img/**/*';

            gulp.src([imgDir])
                .pipe(plugins.plumber())
                .pipe(gulp.dest(config.paths.compileDir + '/assets/img'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log)

            return deferred.promise;
        },

        compileFonts: function() {
            plugins.util.log('Copying fonts');
            var deferred = q.defer(),
                fontDir = config.paths.sourceDir + '/assets/fonts/**/*';

            gulp.src([fontDir])
                .pipe(plugins.plumber())
                .pipe(gulp.dest(config.paths.compileDir + '/assets/fonts'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise
        },

        compileTemplates: function() {
            plugins.util.log('Compiling templates');
            var deferred = q.defer(),
                options = {
                    standalone: true,
                    module: 'app.template'
                };

            gulp.src([config.paths.sourceDir + '/app/**/*.tpl.html', config.paths.sourceDir + '/common/**/*.tpl.html', config.paths.sourceDir + '/components/**/*.tpl.html'])
                .pipe(plugins.minifyHtml({
                    quotes: true
                }))
                .pipe(plugins.angularTemplatecache('templates.tmpl.js', options))
                .pipe(gulp.dest(config.paths.compileDir + '/assets'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        },

        compileIndex: function(path) {
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

                plugins.util.log('Rebuilding statics');

                gulp
                    .src('index.html')
                    .pipe(plugins.plumber())
                    .pipe(inject('assets/vendor.min.*', path, 'vendor'))
                    .pipe(inject(['assets/app.min.*', 'assets/constants.min.js'], path, 'app'))
                    .pipe(inject('assets/*.tmpl.*', path, 'templates'))
                    .pipe(gulp.dest(config.paths.compileDir))
                    .on('end', deferred.resolve)
                    .on('error', plugins.util.log);

                return deferred.promise;
            }
        },

        compileConfig: function() {
            var deferred = q.defer(),
                conf = config['release'];

            plugins.ngConstant({
                    constants: conf,
                    name: 'tuneInstallation.config',
                    stream: true
                })
                .pipe(plugins.concat('constants.min.js'))
                .pipe(gulp.dest(config.paths.compileDir + '/assets'))
                .on('end', deferred.resolve)
                .on('error', plugins.util.log);

            return deferred.promise;
        }
    };
};
