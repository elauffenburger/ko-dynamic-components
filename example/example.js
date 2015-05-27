define(
	[
		"knockout",
		"jquery",
		"knockout-dynamic-components"
	],
	function (ko, $, dynamicComponents) {
		// Register a couple components
		ko.components.register('custom_component_textbox', {
			viewModel: function (params) {
				var self = this;

				// Data
				self.name = ko.observable(params.name);
				
				// Functions
				self.logSelf = logSelf;
				
				//////////
				function logSelf() {
					console.log("Hi! I'm: %O", self);
					console.log("Here's my value raw: %O", self.name());
					console.log("Here's my value unwrapped: %s", dynamicComponents.unwrapObservable(self.name));
				}
			},
			template: '<h1>Value:</h1><input type="text" data-bind="value: name(), valueUpdate: \'keyup\'"><div class="button" data-bind="event: { click: logSelf }">Log me in console!</div>'
		});

		ko.components.register('custom_component_textbox2', {
			viewModel: function (params) {
				var self = this;

				// Data
				self.status = ko.observable(params.status);
				
				// Functions
				self.logSelf = logSelf;
				
				//////////
				function logSelf() {
					console.log("Hi! I'm: %O", self);
					console.log("Here's my value raw: %O", self.status());
					console.log("Here's my value unwrapped: %s", dynamicComponents.unwrapObservable(self.status));
				}
			},
			template: '<h1>Status:</h1><input type="text" data-bind="value: status(), valueUpdate: \'keyup\'"><div class="button" data-bind="event: { click: logSelf }">Log me in console!</div>'
		});

		// Create our viewmodel
		function ViewModel() {
			var self = this;

			self.components = ko.observableArray([
				{
					ComponentTypeId: ko.observable(1),
					Name: ko.observable("I'm Component one!")
				},
				{
					ComponentTypeId: ko.observable(2),
					Status: ko.observable("Ready for action!")
				}
			]);
		}

		// Configure the module
		dynamicComponents.config({
			debug: true,
			elementPrefix: "custom_component_",
			getIdFunction: "ComponentTypeId"
		});

		// Register component settings
		dynamicComponents.registerComponents([
			{
				id: 1,
				name: "textbox",
				params: {
					name: 'Name'
				},
				literal: false
			},
			{
				id: 2,
				name: "textbox2",
				params: {
					status: 'Status'
				},
				literal: false
			}
		]);

		dynamicComponents.run();

		// Finally apply bindings
		ko.applyBindings(new ViewModel());
	});