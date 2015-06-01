define({
	load: function (name, req, onload, config) {
		var configuration = config.config["ko-dynamic-components"];
		
		// If the user requested browser globals
		if (configuration.useGlobals) {
			onload(factory(ko, $));
		} else {
			// Otherwise load normally
			req(["knockout", "jquery"], function (ko, $) {
				onload(factory(ko, $));
			});
		}
		
		//////////
		
		function factory(ko, $) {
			var componentTypeRenderFunctions = {},
				componentRenderFunctions = {},
				configuration = {
					elementPrefix: "",
					initKey: '__component_control_initialized',
					debug: false,
					getIdFunction: 'componentId',
					getTypeIdFunction: 'componentTypeId',
					handlerName: "dynamicComponent"
				},
				logger = {
					error: function () {
						console.error.apply(console, arguments);
					}
				},
				exceptions = {
					NoComponentRegistrationFoundException: function(component) {
						this.component = component;
						this.msg = 'No type or id registration found for component: %O';
						
						logger.error(this.msg, this.component);
					},
					ErrorRegisteringComponentException: function(component) {
						this.component = component;
						this.msg = 'Error registering component: %O';
						
						logger.error(this.msg, this.component);
					}
				};

			var exports = {
				render: render,
				registerComponentType: registerComponentType,
				registerComponentTypes: registerComponentTypes,
				registerComponentById: registerComponentById,
				registerComonentsById: registerComponentsById,
				config: config,
				unwrapObservable: unwrapObservable,
				run: run
			};

			return exports;

			//////////

			function registerComponentById(args) {
				componentRenderFunctions[args.id] = function() {
					return renderFromTemplate(args.name, args.params, args.literal);	
				};
			}
			
			function registerComponentsById(components) {
				for(var i in components) {
					var args = components[i];

					try {
						registerComponentType(args.id, args.name, args.params, args.literal);
					} catch (e) {
						logger.error("Error registering component: %O", e);
					}	
				}
			}

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
				if(!args) {
					return configuration;
				}
				
				for (var key in args) {
					if (configuration.hasOwnProperty(key)) {
						configuration[key] = args[key];
					}
				}
			}

			function registerComponentTypes(components) {
				for (var i in components) {
					var args = components[i];

					try {
						registerComponentType(args.id, args.name, args.params, args.literal);
					} catch (e) {
						logger.error("Error registering component type: %O", e);
					}
				}
			}

			function registerComponentType(id, name, params, literal) {
				componentTypeRenderFunctions[id] = function (component) {
					return renderFromTemplate(name, params, literal);
				};
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
				var idFunction = component[configuration.getIdFunction],
				 	typeIdFunction = component[configuration.getTypeIdFunction];
				
				if(idFunction) {
					var idRenderFunction = componentRenderFunctions[idFunction()];
					
					if(idRenderFunction) {
						return idRenderFunction(component);	
					}
				}
				
				if(typeIdFunction) {
					var typeRenderFunction = componentTypeRenderFunctions[typeIdFunction()];
					
					if(typeRenderFunction) {
						return typeRenderFunction(component);	
					}
				}
				
				throw new exceptions.NoComponentRegistrationFoundException(component);
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
	}
});