define(
	[
		"knockout",
		"jquery",
		"ko-dynamic-components"
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

		ko.components.register('custom_component_override', {
			viewModel: function (params) {
				var self = this;

				// Data
				self.message = ko.observable(params.message);
				
				// Functions
				self.logSelf = logSelf;
				
				//////////
				function logSelf() {
					console.log("Hi! I'm: %O", self);
					console.log("Here's my value raw: %O", self.message());
					console.log("Here's my value unwrapped: %s", dynamicComponents.unwrapObservable(self.message));
				}
			},
			template: '<h1>Overriden Generic Type:</h1><input type="text" data-bind="value: message(), valueUpdate: \'keyup\'"><div class="button" data-bind="event: { click: logSelf }">Log me in console!</div>'
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
				},
				{
					ComponentTypeId: ko.observable(1),
					ComponentId: ko.observable(1),
					Message: ko.observable("I'm special!")
				}
			]);
		}

		// Configure the module
		dynamicComponents.config({
			debug: true,
			elementPrefix: "custom_component_",
			getTypeIdFunction: "ComponentTypeId",
			getIdFunction: "ComponentId"
		});

		// Register component settings
		dynamicComponents.registerComponentTypes([
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
		
		// Register specific components
		// ko-dynamic-components will always render a component by ID
		// before it renders it by the type ID.
		dynamicComponents.registerComponentById({
			id: 1,
			name: "override",
			params: {
				message: 'Message'	
			},
			literal: false
		});

		dynamicComponents.run();

		// Finally apply bindings
		ko.applyBindings(new ViewModel());
	});