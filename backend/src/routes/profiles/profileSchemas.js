import { units, gender } from '../../constants.js';

const maxDate = new Date().toISOString().split('T')[0]; // format: "yyyy-mm-dd"

export const updateUserSchema = {
	body: {
		type: 'object',
		properties: {
			firstName: {
				type: 'string',
			},
			lastName: {
				type: 'string',
			},
			email: {
				type: 'string',
				pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
			},
			password: {
				type: 'string',
				minLength: 6,
			},
			heightCm: {
				type: ['number', 'null'],
				minimum: 0,
			},
			dateOfBirth: {
				type: ['string', 'null'],
				format: 'date',
				formatExclusiveMaximum: maxDate,
			},
			gender: {
				enum: Object.values(gender),
			},
			unitPreference: {
				enum: Object.values(units),
			},
			weekStartsOn: {
				type: 'integer',
				enum: [0, 1], // 0 = Sunday, 1 = Monday
			},
		},
		additionalProperties: false,
	},
};
