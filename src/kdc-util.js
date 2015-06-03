define([

], function () {
	return function (context) {
		/** @module kdc-util */
		
		var 
			// Parent ko-dynamic-components context
			parentContext = context,
			// Injected ko
			ko = context.libs.ko,
			// Injected jQuery
			$ = context.libs.$;
		
		var self = this;
		
		self.constantsRegistered = constantsRegistered;
		self.convertFromPossibleConstant = convertFromPossibleConstant;
		self.renderFromTemplate = renderFromTemplate;
		self.unwrapObservable = unwrapObservable;
		self.validateConfiguration = validateConfiguration;
		self.registerKnockoutHandlers = registerKnockoutHandlers;
		self.$get = $get;
		self.render = render;
		self.getObservableOrValue = getObservableOrValue;
		self.getConstant = getConstant;
		
		//////////
		
		/**
		 * Returns singleton instance
		 *
		 * @method $get
		 * @return {Object} Shared instance of module
		 */
		function $get() {
			return self;	
		}
		
	    /**
         * Given an object, returns a new ko observable if the object is not already an observable,
         * or the object if it is an observable.
         *
         * @method getObservableOrValue
         * @arg {Object} value Either an observable or a value
         * @return {Object} An observable from the value or the value if it was already an observable
         */
		function getObservableOrValue(value) {
		    return ko.isObservable(value) ? value : ko.observable(value || '');
		}

		/**
		 * Validates configuration
		 * 
		 * @method validateConfiguration
		 * @return {Boolean} If configuration is valid
		 */
		function validateConfiguration() {
			return true;
		}
		
		/**
		 * Registers the ko handler used to call ko-dynamic-components,
		 * and provides the function used to render and apply bindings to
		 * a registered component
		 * 
		 * @function registerKnockoutHandlers
		 */
		function registerKnockoutHandlers() {
			function handleLisControl(element, value, bindings, vm, context) {
				// Remove all attached content
				$(element).children().remove();

				$(element).append(render(ko.unwrap(value)()));

				var newBind = ko.utils.domData.get(element, parentContext.configuration.initKey);

				if (newBind) {
					ko.applyBindingsToDescendants({}, element);
				}else{
					ko.utils.domData.set(element, parentContext.configuration.initKey, true);
				}
			}

			ko.bindingHandlers[parentContext.configuration.handlerName] = {
				init: function (element, value, bindings, vm, context) {
					handleLisControl(element, value, bindings, vm, context);
				},
				update: function (element, value, bindings, vm, context) {

				}
			};
		}

		/**
		 * Returns a string containing an Html element to be inserted into the DOM
		 * based on a registered component.  If there is an render function registered
		 * to this component's id, that function will be used, otherwise it will fall back
		 * to the component's type id.  If there is not a component or component type registered
		 * then an exception will be thrown.
		 * 
		 * @method render
		 * @param {Object} component Component to render.
		 * @return {String} A string representing an Html element to be inserted
		 */
		function render(component) {
			var idFunction = component[parentContext.configuration.getIdFunction],
			 	typeIdFunction = component[parentContext.configuration.getTypeIdFunction];
			
			if(idFunction) {
				var idRenderFunction = parentContext.componentRenderFunctions[idFunction()];
				
				if(idRenderFunction) {
					return idRenderFunction(component);	
				}
			}
			
			if(typeIdFunction) {
				var typeRenderFunction = parentContext.componentTypeRenderFunctions[typeIdFunction()];
				
				if(typeRenderFunction) {
					return typeRenderFunction(component);	
				}
			}
			
			if (!parentContext.configuration.failSilent) {
			    throw new parentContext.exceptions.NoComponentRegistrationFoundException(component);
			}
		}
		
		/**
		 * Utility function to unwrap a ko observable up to a certain depth.
		 * 
		 * @method unwrapObservable
		 * @param {Object} obj Observable to unwrap
		 * @param {maxDepth} [maxDepth] Maximum depth before null is returned
		 * @return {Object} Either the unwrapped observable, or null if maxDepth is reached
		 */
		function unwrapObservable(obj, maxDepth) {
			var maxdepth = maxDepth ? maxdepth : 10,
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
		
		/**
		 * Returns if there are any constants registered in configuration
		 * 
		 * @method constantsRegistered
		 * @return {Boolean} If there are any constants registered
		 */
		function constantsRegistered() {
			return Object.keys(parentContext.configuration.constants);
		}

	    /**
         * Gets a previously registered constant
         *
         * @method getConstant
         * @arg {String} key Key to lookup
         * @return {String} String constant with that key
         */
		function getConstant(key) {
		    if (!constantsRegistered) {
		        return '';
		    }

		    var constantWithKey = parentContext.configuration.constants[key] || '';
		    return convertFromPossibleConstant(constantWithKey);
		}

		/**
		 * Checks if value is a request for a constant, and returns that constant,
		 * otherwise returns the original value
		 * 
		 * @function convertFromPossibleConstant
		 * @param {String} value String value which may be a constant
		 * @return {String} Resolved constant or original value
		 */
		function convertFromPossibleConstant(value) {
			var prefixIndex = value.indexOf(parentContext.privates.constantPrefix);

			if (prefixIndex >= 0) {
				return parentContext.configuration.constants[value.substr(parentContext.privates.constantPrefix.length)];
			}
			
			return value;
		}

		/**
		 * Using an element name, parameters for the ko component to render,
		 * and configuration options, returns a string representing an Html element
		 * 
		 * @function renderFromTemplate
		 * @param {String} name Full (or partial if using a prefix) name of element
		 * @param {Object} params Params to parse, resolve, and use as params for ko component
		 * @param {Boolean} isLiteral Whether we should treat provided param values as literal strings, or as expressions
		 */
		function renderFromTemplate(name, params, isLiteral) {
			function makeLiteral(value) {
				return "'" + value + "'";
			}

			var processed_params = "",
				lastKey = Object.keys(params).slice(-1),
				element = parentContext.configuration.elementPrefix + name;

			for (var key in params) {
				var value = params[key];

				if (constantsRegistered()) {
					value = convertFromPossibleConstant(value);
				}

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
	};
});