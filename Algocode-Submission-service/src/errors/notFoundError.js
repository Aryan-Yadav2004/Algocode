import BaseError from "./baseError.js";

import { StatusCodes } from "http-status-codes";

class NotFound extends BaseError {
    constructor(resourceName, resourceValue){
        super("not found", StatusCodes.NOT_FOUND, `${resourceName} is not found with value ${resourceValue}.`, {resourceName, resourceValue});
    }
};

export default NotFound;