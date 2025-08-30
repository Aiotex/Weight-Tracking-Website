const maxDate = new Date().toISOString().split('T')[0] // format: "yyyy-mm-dd"

export const updateGoalSchema = {
	body: {
		type: "object",
		properties: {
			targetWeightKg: {
				type: ["number"],
				minimum: 0,
			},
			targetDate: {
				type: ["string"],
				format: "date",
			},
			startWeightKg: {
				type: ["number"],
				minimum: 0,
			},
			startDate: {
				type: ["string"],
				format: "date",
				formatExclusiveMaximum: maxDate,
			},
		},
		additionalProperties: false,
	}
};

export const createGoalSchema = {
    body: {
        ...updateGoalSchema.body,
        required: ["targetWeightKg", "targetDate", "startWeightKg", "startDate"]
    }
};