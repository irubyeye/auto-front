const schemas = {
	complectation: {
		baseModel: [],
		name: "Create",
		description: {
			en: "",
			ua: "",
		},
		maxSpeed: 0,
		acceleration: 0,
		engine: "",
		transmission: "",
		suspension: "",
	},
	engine: {
		availableFor: [],
		manufacturer: "",
		model: "",
		volume: 0,
		hp: 0,
		torque: 0,
		turbo: false,
	},
	transmission: {
		availableFor: [],
		type: "",
		drive: "",
		gears: 0,
	},
	exterior: {
		availableFor: [],
		exteriorTrim: [],
		wheels: "",
		price: 0,
	},
	interior: {
		availableFor: [],
		seating: [],
		interiorTrim: [],
		color: [],
		price: 0,
	},
	options: {
		availableFor: [],
		type: "",
		description: {
			en: "",
			ua: "",
		},
		item: "",
		price: 0,
	},
	accessories: {
		type: "",
		description: {
			en: "",
			ua: "",
		},
		quantity: "",
		price: 0,
	},
	colors: {
		availableFor: [],
		name: "",
	},
	wheel: {
		availableFor: [],
		diameter: 0,	// см
		type: {
			en: "",
			ua: "",
		},
	},
	suspension: {
		availableFor: [],
		type: ""
	},
}

export default schemas;