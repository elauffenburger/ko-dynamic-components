// Define a plugin to check for require config options
define("kdc-loader", {
	load: function(name, req, onload, config) {
		// If the user requested browser globals
		if (config.useGlobals) {
			req(["../dist/kdc-base"], function(factory) {
        		onload(factory(ko, $));
			});
		} else {
		    // Otherwise load normally
		    req(["knockout", "jquery", "../dist/kdc-base"], function(ko, $, factory) {
				onload(factory(ko, $));
			});
		}
	}
});