# ko-dynamic-components
Registers knockout components and dynamically inserts/binds them

## What is this?

ko-dynamic-components is an AMD module that allows you to register Knockout.js components that you'd like to load dynamically.  It provides a handler you can include in your markup to load components as child elements.  This is especially useful in scenarios where you are trying to render components whose configuration is stored in the database.

## Setting up your environment

You're going to want to make sure your environment is set up to include Knockout as a module named "knockout" and jQuery as a module named "jquery".  Here's a sample of how that ***could*** work.

```javascript
require.config({
	paths: {
    	knockout: "/path/to/your/knockout",
        jquery: "/path/to/your/jquery"
    },
	map: {
		"*": {
			"ko-dynamic-components": "ko-dynamic-components!"
		}
	}
});
```

This will ensure that when you request "knockout", it grabs the module from that location.  However, you may already be using Knockout as "ko" somewhere else and would like to just use that instance.  In that case, try using a map:

```javascript
	require.config({
    	paths: {
        	ko: "path/to/your/knockout",
            $: "path/to/your/jquery"
        },
        map: {
			"*": {
				"ko-dynamic-components": "ko-dynamic-components!"
			},
			"ko-dynamic-components" : {
            	"knockout": "ko",
                "jquery": "$"
            }
		}
    }
```

You may need to shim jQuery if you're using a version older than 1.11.

## Real-World Example

If you'd like to see a real example, take a look at the "example" folder.  It contains a simple app that can show you the finer points of how an application can take use of this module.  To spin up a simple server, navigate to the root of the repo (not the root of example), and run the following:

```shell
	npm install -g http-server
    http-server
```

This will launch a web server running on port 8080.  Then, just go to [localhost](http://localhost:8080/example/example.html) and check it out!

## Quickstart

Because dynamic-components does something that's semi-complicated and not really generic, you'll need to configure a few things first.  Again, I recommend looking at the provided example to get a feel for configuration.

#### Creating a component
Creating a component in knockout is outside the scope of this documentation, but here's a simple one:

```js
	ko.components.register('custom_component_textbox', {
      viewModel: function (params) {
        var self = this;

        self.name = ko.observable(params.name);
        self.logSelf = 	function() {
          console.log("Hi! I'm: %O", self);
          console.log("Here's my value raw: %O", self.name());
          console.log("Here's my value unwrapped: %s", dynamicComponents.unwrapObservable(self.name));
        }
      },
      template: '<h1>Value:</h1><input type="text" data-bind="value: name(), valueUpdate: \'keyup\'"><div class="button" data-bind="event: { click: logSelf }">Log me in console!</div>'
	});
```

Notice that this component has an observable, "name", that we use in the binding handler "value".   Now, let's set up a ViewModel for our page: 

```js
  function ViewModel() {
    var self = this;

    self.component = ko.observable(
	  {
        ComponentTypeId: ko.observable(1),
        Name: ko.observable("I'm Component one!")
      });
  }
```

Here, we have our ViewModel with a single observable, "component", that represents an object, potentially pulled from the database and mapped using ko.mapping.fromJS(...).  What we're going to do is bind the information in this "component" object to an instance of our previously registered Knockout component.

First, we'll have to configure dynamic-components:

```js
	dynamicComponents.config({
    	debug: true, // useful for getting error messages
     	elementPrefix: "custom_component_", // used as a prefix for our components we target
        getIdFunction: "ComponentTypeId" // name of the function in our viewmodel's component(s) that returns component type ids (this will make more sense in a second)
    });
```

Now we can register our component mappings in dynamic-components.  You might have some questions about what those parameters mean; here's a quick overview:
* **debug**: If we want ko-dynamic-components to report debug information
* **elementPrefix**: The prefix of all knockout components we will target.  For example, we're about to register a component that we want to be rendered as a "custom_component_textbox" (the component we previously registered with knockout).  We can do this by setting the global prefix of dynamic-components to "custom_component\_" and (later), the **name** of the component registered in dynamic-components to "textbox", thereby naming the component **"custom_component_textbox"** (the concatentation of the two)
* **getIdFunction**: The function we can use to get the id of the component ***type*** for a given component registration.

Now, let's register our component mappings in dynamic-components:
```js
	dynamicComponents.registerComponent(1, "textbox", {
    	name: "Name"
    }, false);
```

...and start dynamic-components:
```js
	dynamicComponents.start();
```

We're now free to bind our ViewModel and run the app as normal:
```js
	ko.applyBindings(new ViewModel());
```

Let's talk about what we did.  What we said is that for all components that have a component type **id 1**, we want them rendered with **element name "custom_component_textbox"**, and that the **member variable "Name" in that component** should be mapped to a key, **"name"** in the params object passed to the component ViewModel.  The last argument (here, **false**) means that we should take the string "Name" not as the string literal "Name", but as the name of a member variable (in this case, "Name").

Finally, let's take a look at some HTML:
```html
	<div data-bind="dynamicComponent: component"></div>
```

This mapping is all it takes to render that component we defined.  Here's what will be rendered:
```html
	<div data-bind="dynamicComponent: component">
    	<custom_component_textbox params="name: Name">
        	<h1>Value:</h1>
            <input type="text" data-bind="value: name(), valueUpdate: 'keyup'">
            <div class="button" data-bind="event: { click: logSelf }">Log me in console!</div>
        </custom_component_textbox>
    </div>
```

Note that we didn't replace the outer tag; instead, we just inserted the component *into* it.

To see the full source, check out "example" in the root folder and read the section [Real-World Example](https://github.com/elauffenburger/ko-dynamic-components#real-world-example)

## Configuration Options

dynamic-components has a few configuration options (most of which are explored above), but some exist *outside* of the normal dynamicComponents.config(...) method -- these are set via require.config(...).

This will map all requests in your application for ko-dynamic-components to the loader version of the module, which will support requirejs config options.  The only reason you wouldn't want to use this version is if you aren't going to take advantage of those configuration options and don't feel comfortable with more complicated requirejs configuration.

**require.js options**
```js
	// Assuming module loaded as "ko-dynamic-components"
	requirejs.config({
    	config: {
        	"ko-dynamic-components": {
            	useGlobals: true // Will load module with browser globals for external libraries (knockout & jQuery).  Useful if you've already defined/configured those libraries
            }
        }
    });
```

**ko-dynamic-components options**
```js
	// Assuming we required module with variable name dynamicComponents
	dynamicComponents.config({
    	// Prefix for tags of components to load (think of it as enforcing a namespace
    	elementPrefix: "our-component-prefix-",
        // Used to mark a DOM node as being bound to a ViewModel by knockout; 
        // probably the one thing you won't need to configure
        initKey: "__our_key_", 
        // Enables debug mode
        debug: true, 
        // Name of function that can be called to get id of component type 
        // so we can map it (1: custom-textbox, 2: custom-textarea, etc.)
        getIdFunction: 'getId', 
        // Name of bindingHandler used to load a component 
        // (e.g. <div data-bind="dynamicComponent: $root.component"></div>)
        handlerName: "dynamicComponent" 
    });
```