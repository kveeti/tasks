type PageLocations = {
	[key: string]: {
		[key: string]: "left" | "right";
	};
};

export const pageLocations: PageLocations = {
	"/": {
		"/settings": "right",
		"/stats": "left",
	},
	"/settings": {
		"/": "left",
		"/stats": "left",
	},
	"/stats": {
		"/": "right",
		"/settings": "right",
	},
};
