import { StatusCodes } from "http-status-codes";
import BaseError from "./baseError.js";


class BadRequest extends BaseError{
    constructor(propertyName, details){
        super("bad request", StatusCodes.BAD_REQUEST, `Invalid structure for ${propertyName} provided.`, details);
    }
};

export default BadRequest;