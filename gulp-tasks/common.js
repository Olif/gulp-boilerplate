var exports = module.exports = {};

var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files'),
    plugins = require('gulp-load-plugins')(),
    del = require('del'),
    q = require('q'),
    paths = require('path'),
    requireDir = require('require-dir'),

    buildDir = 'build',
    compileDir = 'bin',
    sourceDir = 'src',
    vendorDir = 'vendor';


// Cleans the directory specified by relativePath
exports.clean = function(relativePath) {
    plugins.util.log('Cleaning ' + relativePath);
    var deferred = q.defer();
    del([relativePath], {
        force: true
    }, deferred.resolve);
    return deferred.promise;
}

exports.bytediffFormatter = function(data) {
    var formatPercent = function(num, precision) {
        return (num * 100).toFixed(precision);
    };
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';

    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
        ' and is ' + formatPercent(1 - data.percent, 2) + '%' + difference;
}
