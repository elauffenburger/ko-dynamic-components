var require = {
	paths: {
		"knockout": "libs/knockout",
		"jquery": "libs/jquery",
		"knockout-dynamic-components": "../dist/knockout-dynamic-components",
		"kdc-loader": "../dist/kdc-loader"
	},
	map: {
		"*": {
			"knockout-dynamic-components": "kdc-loader!"	
		}	
	},
	config: {
		"knockout-dynamic-components": {
			useGlobals: true
		}	
	}
};