// Check if define(...) is defined
if (typeof (define) === "function") {
    // Use AMD
	define("knockout-dynamic-components", ["../dist/kdc-base", "knockout", "jquery"], function(factory, ko, $) {
		return factory(ko, $);
	});
}