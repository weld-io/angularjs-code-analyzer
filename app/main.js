/**
* main.js
*/

'use strict';

var async = require('async');
var files = require('./files');
var analysis = require('./analysis');

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
	console.log('Usage: npm start FILENAME');
	process.exit(1);
};

var fileList = [];
var rootPath = '';

// process.argv -> two arrays of files/options
var processCommandLineArguments = function () {
	var result = { files: [], options: [] };
	for (var i = 1; i < process.argv.length; i++) {
		if (process.argv[i][0] === '-') {
			result.options.push(process.argv[i].substr(1));
		}
		else {
			result.files.push(process.argv[i]);
		}
	}
	return result;
};

var cmdLineParams = processCommandLineArguments();

// Make file list from folders
for (var i = 0; i < cmdLineParams.files.length; i++) {
	if (files.isDirectory(cmdLineParams.files[i])) {
		rootPath = cmdLineParams.files[i];
		rootPath += (rootPath[rootPath.length - 1] !== '/' ? '/' : '');
		files.traverseDirectory(cmdLineParams.files[i], fileList);
	}
	else {
		fileList.push(cmdLineParams.files[i]);
	}
}

// Loop through each file
for (var i = 0; i < fileList.length; i++) {
	files.openFile(fileList[i], analysis.analyze);
}

async.forEachOf(fileList,
	// For each
	function (file, id, cb) {
		files.openFile(file, function (filename, str) {
			analysis.analyze(filename.replace(rootPath, ''), str);
			cb();
		})
	},
	// When all done
	analysis.report.bind(this, cmdLineParams.options)
);
