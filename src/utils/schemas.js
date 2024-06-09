const schemas = {
	bodyTypes: ["sedan", "universal", "hatchback", "coupe", "minivan", "buggy", "convertible/cabriolet", "fastback", "limousine", "roadster", "shooting-brake", "targa-top", "pickup", "muscle car", "SUV"],
	brands: ["Chevrolet", "Ford", "Dodge", "Infiniti", "Tesla", "Ferrari", "Lamborghini", "Alfa Romeo", "Fiat", "Maserati", "BMW", "Mercedes", "Volkswagen", "Audi", "Porsche", "Jaguar", "Aston Martin", "McLaren", "Renault", "Citroen", "Toyote", "Nissan", "Honda", "Mazda", "Subaru", "Mitsubishi", "Lexus", "Suzuki", "Hyundai",],
	car: {
		img: [],
		origin: "",
		brand: "",
		model: "",
		body: "",
		engineDisplacement: "rear",
		modelYear: 0,
		basePrice: 0,
	},
	complectation: {
		baseModel: [],
		name: "Create",
		description: {
			en: "",
			ua: "",
		},
		maxSpeed: 0,
		acceleration: 0,
		engine: {
			availableFor: [],
			manufacturer: "",
			model: "",
			volume: 0,
			hp: 0,
			torque: 0,
			turbo: false,
			price: 0,
		},
		transmission: {
			availableFor: [],
			type: "",
			drive: "",
			gears: 0,
			price: 0,
		},
		suspension: {
			availableFor: [],
			type: "",
			price: 0,
		},
	},
	interior: {
		trim: "",
		seatings: "",
		features: [],
	},
	exterior: {
		bumpers: "",
		spoiler: "",
		wheels: "",
		features: []
	},
	appearanceItem: {
		availableFor: [],
		type: "",
		value: {
			en: "",
			ua: ""
		},
		colors: [],
		price: 0,
	},
	wheel: {
		availableFor: [],
		model: { type: String, required: true },
		diameter: 0,	// milimeter
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
}

export default schemas;