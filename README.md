# AngularJS Code Analyzer

Static analysis of AngularJS modules and dependencies.

Made by the **Weld** team ([www.weld.io](https://www.weld.io)).

## Usage

	npm start [Angular source code path]	

## What it does

AngularJS Code Analyzer loops through the code on the given path, and performs three tests:

### 1. Unused dependencies

Checks if a component has listed a dependency that then isn’t used inside the code itself:

	myApp.common.ui: helpIcon (dependencies: 4)
		unused dependency: User
		unused dependency: $rootScope

	myApp.project.editor: DomainCtrl (dependencies: 11)
		unused dependency: $stateParams

### 2. External modules

Checks if a component has listed a dependency that is in a *different module* than itself:

	myApp.user: Access (dependencies: 5)
	  external module: Subscription (myApp.subscription)
	  external module: projectManager (myApp.project.view)

### 3. Module file locations

Checks module name vs. file path and see if they differ:

	Wrong module: teamModel: is myApp.common.extra, should be myApp.user
	
	Wrong module: docsService: is myApp.user, should be myApp.docs
