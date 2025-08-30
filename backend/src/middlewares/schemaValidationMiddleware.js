import HttpException from '../utils/httpException.js';
import addFormats from 'ajv-formats';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const ajvErrorHandler = {
	/**
	 * Maps Ajv error keywords to custom messages
	 */
	required: (err, field) => `Required field`, //${err.params.missingProperty}
	minLength: (err, field) => `${field} must be at least ${err.params.limit} characters`,
	maxLength: (err, field) => `${field} must be at most ${err.params.limit} characters`,
	pattern: (err, field) => `${field} is not in the correct format`,
	type: (err, field) => `${field} must be of type ${err.params.type}`,
	additionalProperties: (err, field) => `${err.params.additionalProperty} is not allowed`,
	enum: (err, field) => `${field} must be one of: ${err.params.allowedValues.join(', ')}`,
	minimum: (err, field) => `${field} must be >= ${err.params.limit}`,
	maximum: (err, field) => `${field} must be <= ${err.params.limit}`,
	format: (err, field) => `${field} must be a valid ${err.params.format === 'date' ? 'date in YYYY-MM-DD format' : err.params.format}`,
};

const formatAjvErrors = (ajvErrors) => {
	// TODO: lowercase the error msg
	/**
	 * Converts Ajv error array to uniform [{ field, issue }] format using ajvErrorHandler
	 * Removes duplicate fields, keeping the first error per field.
	 */
	const seen = new Set();

	return ajvErrors.flatMap((err) => {
		const field = err.instancePath.replace(/^\//, '') || err.params?.missingProperty || err.params?.additionalProperty || 'unknown';

		if (seen.has(field)) return [];
		seen.add(field);

		const handler = ajvErrorHandler[err.keyword];
		const issue = handler ? handler(err, field) : err.message || 'Invalid input';
		return [{ field, issue }];
	});
};

const verify = (schema) => {
	/**
	 * Compiles the schema provided in argument and validates the data for the
	 * compiled schema. raises any errors if there are any
	 * Supports schema.body, schema.query, schema.params
	 */
	if (!schema) {
		throw new Error('Schema not provided');
	}

	return (req, res, next) => {
		const parts = ['body', 'query', 'params'];

		// Sanitize input for body, query, and params
		parts.forEach((key) => {
			if (req[key]) {
				Object.keys(req[key]).forEach((k) => {
					if (typeof req[key][k] === 'string') req[key][k] = req[key][k].trim();
				});
			}
		});

		// Validate each part if a schema is provided for it
		for (const part of parts) {
			if (schema[part]) {
				const validate = ajv.compile(schema[part]);
				const isValid = validate(req[part]);
				if (!isValid) {
					throw new HttpException(422, formatAjvErrors(validate.errors));
				}
			}
		}

		return next();
	};
};

export default verify;
