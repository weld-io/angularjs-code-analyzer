/**
* analysis.js
*/

'use strict';

var _ = require('lodash');

// Private functions

var componentList = {};

var addComponent = function (filename, componentInfo) {
	componentList[componentInfo.name] = componentInfo;
	componentList[componentInfo.name].filename = filename;
	componentList[componentInfo.name].dependencies = _.compact(_.map(componentInfo.dependencies.split(','), function (dep) {
		return dep.trim();
	}));
	delete componentInfo.undefined;
	return componentList[componentInfo.name];
};

var sortComponentList = function () {
	return _.sortBy(componentList, ['module', 'name']);
};

// http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
var countStringOccurrences = function occurrences(string, subString, allowOverlapping) {
	string += "";
	subString += "";
	if (subString.length <= 0) return (string.length + 1);

	var n = 0,
		pos = 0,
		step = allowOverlapping ? 1 : subString.length;

	while (true) {
		pos = string.indexOf(subString, pos);
		if (pos >= 0) {
			++n;
			pos += step;
		} else break;
	}
	return n;
};

var reportExternalModules = function (compList) {
	console.log('\n----- REPORT: EXTERNAL MODULES -----\n');
	_.forEach(compList, function (componentInfo, key) {
		let hasOutsideDependency = false;
		let depList = '';
		_.forEach(componentInfo.dependencies, function (dep) {
			let depModule = _.get(componentList, dep + '.module');
			if (depModule && depModule !== componentInfo.module) {
				hasOutsideDependency = true;
				depList += `  external module: ${dep} (${depModule}) from ${componentInfo.module}\n`;
			}
		});
		if (hasOutsideDependency) {
			console.log('%s: %s (dependencies: %d)', componentInfo.module, componentInfo.name, componentInfo.dependencies.length);
			console.log(depList);
		}
	});
};

var analyzeDependencyOccurrence = function (componentInfo, str) {
	componentInfo.dependenciesCount = {};
	_.forEach(componentInfo.dependencies, function (dep) {
		componentInfo.dependenciesCount[dep] = countStringOccurrences(str, dep);
	});
	return componentInfo;
};

var reportUnusedDependencies = function (compList) {
	console.log('\n----- REPORT: UNUSED DEPENDENCIES -----\n');
	_.forEach(compList, function (componentInfo, key) {
		let hasUnusedDependency = false;
		let depList = '';
		_.forEach(componentInfo.dependenciesCount, function (depCount, depName) {
			if (depCount < 2) {
				hasUnusedDependency = true;
				depList += `  unused dependency: ${depName}\n`;
			}
		});
		if (hasUnusedDependency) {
			console.log('%s: %s (dependencies: %d)', componentInfo.module, componentInfo.name, componentInfo.dependencies.length);
			console.log(depList);
		}
	});
};

var reportModuleFileLocations = function (compList) {
	console.log('\n----- REPORT: MODULE FILE LOCATIONS -----\n');
	_.forEach(compList, function (componentInfo, key) {
		var moduleDerivedByLocation = getModuleNameFromFilename(componentInfo.filename);
		//console.log(componentInfo.name, componentInfo.module, getModuleNameFromFilename(componentInfo.filename));
		if (componentInfo.module !== moduleDerivedByLocation) {
			console.log('Wrong module: %s: is %s, should be %s\n', componentInfo.name, componentInfo.module, moduleDerivedByLocation);
		}
	});
};

var getModuleNameFromFilename = function (filename) {
	var parts = filename.split('/');
	var moduleName = 'weld';
	for (var i = 0; i < parts.length - 2; i++) {
		moduleName += '.' + parts[i];
	}
	return moduleName;
};

// Public API
module.exports = {

	analyze: function (filename, str) {
		// https://regex101.com/r/WJIQLE/2
		const regex = /angular\.module\('(.*)'\)\.(.*)\('(.*)',\s?function\s?\((.*)\)\s?\{/g;
		let m;
		while ((m = regex.exec(str)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			// The result can be accessed through the `m`-variable.
			let variableMapping = {
				1: 'module',
				2: 'type',
				3: 'name',
				4: 'dependencies',
			}
			let componentInfo = {};
			m.forEach((match, groupIndex) => {
				componentInfo[variableMapping[groupIndex]] = match;
				//console.log(groupIndex, componentInfo);
				if (groupIndex === 4) {
					let comp = addComponent(filename, componentInfo);
					analyzeDependencyOccurrence(comp, str);
				}
			});
		}
	},

	report: function (options) {
		var sortedComps = sortComponentList();
		reportUnusedDependencies(sortedComps);
		reportExternalModules(sortedComps);
		reportModuleFileLocations(sortedComps);
	},

};