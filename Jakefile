var sys = require('util');
var fs = require('fs');
var exec = require('child_process').exec;

desc("This is the default task.");
task("default", function(params) {
	//Do something.
});

desc("Runs all the tests.");
task("test", function(params){
	exec("jasmine-node spec/", function (error, stdout, stderr) {
		sys.print(stdout);
	});
});

desc("Builds the project into a minified file.");
task("build", function(params){
	console.log("Building the project into a minified file...")
	exec("browserify src/client.js  -o dist/goom-client.js", function (error, stdout, stderr) {
		sys.print(stdout);
		if (error)
			sys.print(stderr);
		else
			console.log("The file is ready at dist/goom-client.js");
	});
});
