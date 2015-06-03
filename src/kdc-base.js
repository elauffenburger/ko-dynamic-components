define([
	"kdc-util"
], function(Utils) {
	function factory(ko, $) {			
			var 
				// Map of functions used to render components by type id
				componentTypeRenderFunctions = {},
				// Map of functions used to render components by component id
				componentRenderFunctions = {},
				// Map of configuration options
				configuration = {
					// Prefix for rendered element names
					elementPrefix: "",
					// Key used to store component initialization state
					// See "kdc-util~registerKnockoutHandlers for more info
					initKey: '__component_control_initialized',
					// If we're in debug mode
					debug: false,
					// Name of function used to get a component's id
					getIdFunction: 'componentId',
					// Name of function used to get a component's type id
					getTypeIdFunction: 'componentTypeId',
					// Name of ko bindingHandler to register
					handlerName: "dynamicComponent",
					// Registered constants that can be used to shorthand
					// configuration options
					constants: {},
                    // If we should let a failure to lookup a component fail
                    failSilent: true
				},
				// Logger that can be turned on/off
				logger = {
					debug: function() {
						if(configuration.debug) {
							console.debug.apply(console, arguments);	
						}	
					},
					error: function () {
						console.error.apply(console, arguments);
					}
				},
				// Exceptions
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
				},
				// Configuration options that shouldn't be exposed
				// to the user
				privates = {
					constantPrefix: 'kdc:',
					utils: {}
				};
			
			/** @module ko-dynamic-components */
			var exports = {
				render: null,
				registerComponentType: registerComponentType,
				registerComponentTypes: registerComponentTypes,
				registerComponentById: registerComponentById,
				registerComonentsById: registerComponentsById,
				config: config,
				utils: null,
				run: run
			};
			
			// Initialize module
			init();

			return exports;

			//////////
			
			/**
			 * Initializes module
			 * 
			 * @function init
			 */
			function init() {
				var utils = new Utils(getContextDto());
				
				privates.utils = utils;
				exports.utils = utils.$get;
				exports.render = utils.render; 
			}
			
			/**
			 * Starts module and begins listening for changes
			 * 
			 * @method run
			 */
			function run() {
				if (privates.utils.validateConfiguration()) {
					privates.utils.registerKnockoutHandlers();
				}
			}

			/**
			 * Either returns or sets configuration based of presence of argument
			 * 
			 * @function config
			 * @param {Object} [args] If present, contains args to set
			 * @returns {Object} Returns only if argument is omitted 
			 */
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
			
			/**
			 * Method to return an object exposing members we'd like
			 * other internal modules to see
			 * 
			 * @function getContextDto
			 * @returns {Object} An object containing exposed members
			 */
			function getContextDto() {
				return {
					configuration: configuration,
					privates: privates,
					libs: {
						ko: ko,
						$: $	
					},
					exceptions: exceptions,
					componentTypeRenderFunctions: componentTypeRenderFunctions,
					componentRenderFunctions: componentRenderFunctions
				};
			}

			/**
			 * Registers a component by its component id
			 * 
			 * @method registerComponentById
			 * @param {Object} args Object containing information used to register a render function
			 */
			function registerComponentById(args) {
				componentRenderFunctions[args.id] = function() {
					return privates.utils.renderFromTemplate(args.name, args.params, args.literal);	
				};
			}
			
			/**
			 * Registers multiple components by their component ids
			 * 
			 * @method registerComponentsById
			 * @param {Object[]} components Array of objects containing information used to register a render function
			 */
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
			
			/**
			 * Registers a component by its type id
			 * 
			 * @method registerComponentById
			 * @param {Object} args Object containing information used to register a render function
			 */
			function registerComponentType(id, name, params, literal) {
				componentTypeRenderFunctions[id] = function (component) {
					return privates.utils.renderFromTemplate(name, params, literal);
				};
			}

			/**
			 * Registers multiple components by their type ids
			 * 
			 * @method registerComponentTypes
			 * @param {Object[]} components Array of objects containing information used to register a render function
			 */
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
		}
		
		return factory;
});