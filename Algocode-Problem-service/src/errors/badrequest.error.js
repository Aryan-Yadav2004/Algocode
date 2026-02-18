import BaseError from "./base.error.js";
import { StatusCodes } from "http-status-codes";
class BadRequest extends BaseError {
    constructor(propertyName, details) {
        super("BadRequest", StatusCodes.BAD_REQUEST, `Invalid Structure for ${propertyName} provided`, details);
    }
}
export default BadRequest;