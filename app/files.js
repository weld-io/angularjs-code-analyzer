/**
* files.js
*/

'use strict';

var fs = require('fs');

// Public API
module.exports = {

	openFile: function (filename, cb) {
		fs.readFile(filename, 'utf8', function (err, data) {
			if (err) {
				throw err;
			}
			else if (cb) {
				cb(filename, data);
			}
		});
	},

	isDirectory: function (path) {
		return fs.statSync(path).isDirectory();
	},

	// https://gist.github.com/kethinov/6658166
	/** List all files in a directory in Node.js recursively in a synchronous fashion */
	traverseDirectory: function (dir, filelist) {
		dir += (dir[dir.length - 1] !== '/' ? '/' : '');
		var files = fs.readdirSync(dir);
		filelist = filelist || [];
		files.forEach(function (file) {
			if (fs.statSync(dir + file).isDirectory()) {
				filelist = module.exports.traverseDirectory(dir + file + '/', filelist);
			}
			else {
				filelist.push(dir + file);
			}
		});
		return filelist;
	},

};