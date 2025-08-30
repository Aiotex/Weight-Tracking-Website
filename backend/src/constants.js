export const IMG_UPLOAD_DIR = 'public/images';

export const ACCESS_TOKEN_EXPIRES_IN = '30d';
export const REFRESH_TOKEN_EXPIRES_IN = '30d';

export const errorStatusMessages = {
	400: 'The request was invalid or cannot be processed.',
	401: 'Authentication is required or has failed.',
	403: 'You do not have permission to access this resource.',
	404: 'The requested resource was not found.',
	409: 'A conflict occurred with the current state of the resource.',
	422: 'One or more validation errors occurred.',
	500: 'An unexpected error occurred on the server.',
	502: 'Received an invalid response from the upstream server.',
	503: 'The server is currently unavailable.',
	504: 'The upstream server did not respond in time.',
};

export const roles = {
	ADMIN: 'ADMIN',
	USER: 'USER',
	DEMO: 'DEMO',
};

export const units = {
	METRIC: 'METRIC',
	/*
      Length: Millimeter (mm), Centimeter (cm), Meter (m), Kilometer (km)
      Weight: Milligram (mg), Gram (g), Kilogram (kg), Tonne (t)
      Volume: Milliliter (mL), Liter (L)
      Temperature: Celsius (°C)
    */
	IMPERIAL: 'IMPERIAL',
	/*
      Length: Inch (in), Foot (ft), Yard (yd), Mile (mi)
      Weight: Ounce (oz), Pound (lb), Stone (st), Ton (US)
      Volume: Fluid ounce (fl oz), Cup (cup), Pint (pt), Quart (qt), Gallon (gal)
      Temperature: Fahrenheit (°F)
    */
};

export const gender = {
	MALE: 'MALE',
	FEMALE: 'FEMALE',
	OTHER: 'OTHER',
};
