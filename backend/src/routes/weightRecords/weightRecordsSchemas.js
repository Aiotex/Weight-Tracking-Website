const maxDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // format: "yyyy-mm-dd", one day after today
// TODO: look into the date not changing when the server is runing for a long time

export const getRecordsInRangeSchema = {
	query: {
		type: 'object',
		properties: {
			start_date: {
				type: ['string'],
				format: 'date',
				formatExclusiveMaximum: maxDate,
			},
			end_date: {
				type: ['string'],
				format: 'date',
				formatExclusiveMaximum: maxDate,
			},
		},
		additionalProperties: false,
	},
};

export const getWeightAveragesSchema = {
	params: {
		type: 'object',
		properties: {
			group: {
				type: 'string',
				enum: ['weekly', 'monthly', 'yearly'],
			},
		},
		required: ['group'],
		additionalProperties: false,
	},
	query: {
		type: 'object',
		properties: {
			...getRecordsInRangeSchema.query.properties,
			week_starts_on: {
				type: ['string'],
				enum: ['0', '1'], // 0 = Sunday, 1 = Monday
				default: '0',
			},
		},
	},
};

export const updateWeightSchema = {
	body: {
		type: 'object',
		properties: {
			weightKg: {
				type: ['number'],
				minimum: 0,
			},
			notes: {
				type: ['string', 'null'],
				maxLength: 100,
				minLength: 1,
			},
		},
		additionalProperties: false,
	},
};

export const createWeightSchema = {
	body: {
		type: 'object',
		properties: {
			weightKg: {
				type: ['number'],
				minimum: 0,
			},
			date: {
				type: ['string'],
				format: 'date',
				formatExclusiveMaximum: maxDate,
			},
			notes: {
				type: ['string', 'null'],
				maxLength: 100,
				minLength: 1,
			},
		},
		additionalProperties: false,
		required: ['weightKg', 'date'],
	},
};
