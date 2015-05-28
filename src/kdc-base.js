define("kdc-base", [], function () {
	 return function(ko, $) {
		var renderFunctions = {},
			configuration = {
				elementPrefix: "",
				initKey: '__component_control_initialized',
				debug: false,
				getIdFunction: 'componentId',
				handlerName: "dynamicComponent"
			},
			logger = {
				error: function () {
					console.error.apply(console, arguments);
				}
			}

		var exports = {
			render: render,
			registerComponent: registerComponent,
			registerComponents: registerComponents,
			config: config,
			unwrapObservable: unwrapObservable,
			run: run
		};

		return exports;

		//////////

		function unwrapObservable(obj) {
			var maxdepth = 10,
				depth = 0;

			while (ko.isComputed(obj) || ko.isObservable(obj)) {
				obj = obj();

				if (depth == maxdepth) {
					return null;
				}

				depth++;
			}

			return obj;
		}

		function validateConfiguration() {
			return true;
		}

		function run() {
			if (validateConfiguration()) {
				registerKnockoutHandlers();
			}
		}

		function config(args) {
			for (var key in args) {
				if (configuration.hasOwnProperty(key)) {
					configuration[key] = args[key];
				}
			}
		}

		function registerComponents(components) {
			for (var i in components) {
				var args = components[i];

				try {
					registerComponent(args.id, args.name, args.params, args.literal);
				} catch (e) {
					logger.error("Error registering component: %O", e);
				}
			}
		}

		function registerComponent(id, name, params, literal) {
			renderFunctions[id] = function (component) {
				return renderFromTemplate(name, params, literal);
			}
		}

		function registerKnockoutHandlers() {
			function handleLisControl(element, value, bindings, vm, context) {
				// Remove all attached content
				$(element).children().remove();

				$(element).append(render(ko.unwrap(value)()));

				var newBind = ko.utils.domData.get(element, configuration.initKey);

				if (newBind) {
					ko.applyBindingsToDescendants({}, element);
				}

				if (!newBind) {
					ko.utils.domData.set(element, configuration.initKey, true);
				}
			}

			ko.bindingHandlers[configuration.handlerName] = {
				init: function (element, value, bindings, vm, context) {
					handleLisControl(element, value, bindings, vm, context);
				},
				update: function (element, value, bindings, vm, context) {

				}
			}
		}

		function render(component) {
			var id = component[configuration.getIdFunction]();

			return renderFunctions[id](component);
		}

		function renderFromTemplate(name, params, isLiteral) {
			function makeLiteral(value) {
				return "'" + value + "'";
			}

			var processed_params = "",
				lastKey = Object.keys(params).slice(-1),
				element = configuration.elementPrefix + name;

			for (var key in params) {
				var value = params[key];
				if (isLiteral) {
					value = makeLiteral(value);
				}

				processed_params += key + ": " + value;

				if (key != lastKey) {
					processed_params += ", ";
				}
			}

			return '<' + element + ' params="' + processed_params + '"></' + element + '>';
		}
	}
});