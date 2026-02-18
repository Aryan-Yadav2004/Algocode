import BaseError from "./base.error.js";
import { StatusCodes } from "http-status-codes";
class NotFound extends BaseError {
    constructor(resourceName, resourceValue) {
        super("Not Found", StatusCodes.NOT_FOUND, `The requested resource ${resourceName} with value ${resourceValue} not found`, {resourceName, resourceValue});
    }
}
export default NotFound;