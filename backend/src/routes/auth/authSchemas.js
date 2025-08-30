export const loginSchema = {
	body: {
		type: 'object',
		properties: {
			email: {
				type: 'string',
				pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
			},
			password: {
				type: 'string',
				minLength: 6,
			},
		},
		required: ['email', 'password'],
		additionalProperties: false,
	},
};

export const registerSchema = {
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
		},
		required: ['firstName', 'lastName', 'email', 'password'],
		additionalProperties: false,
	},
};
