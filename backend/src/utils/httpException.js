import { errorStatusMessages } from "../constants.js";

export default class HttpException extends Error { 
  constructor(statusCode, details) {
    const message = errorStatusMessages[statusCode] || errorStatusMessages[500]

    super(message);
    this.statusCode = statusCode
    this.details = details;
  }
}