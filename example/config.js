var require = {
	baseUrl: "",
	paths: {
		"knockout": "libs/knockout",
		"jquery": "libs/jquery",
		"ko-dynamic-components": "../dist/ko-dynamic-components"
	},
	map: {
		"*": {
			"ko-dynamic-components": "ko-dynamic-components!"	
		}	
	},
	config: {
		"ko-dynamic-components": {
			useGlobals: false
		}	
	}
};