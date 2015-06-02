define({
	load: function (name, req, onload, config) {
		var configuration = config.config["ko-dynamic-components"];
		
		// If the user requested browser globals
		if (configuration.useGlobals) {
			req(["kdc-base"], function(factory) {
				onload(new factory(ko, $));
			});
		} else {
			// Otherwise load normally
			req(["knockout", "jquery", "kdc-base"], function (ko, $, factory) {
				onload(new factory(ko, $));
			});
		}
	}
});