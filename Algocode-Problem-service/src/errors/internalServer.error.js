import BaseError from "./base.error.js";
import { StatusCodes } from "http-status-codes";

class InternalServerError extends BaseError {
    constructor(details){
        super("InternalServerError", StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", details);
    }
}
export default InternalServerError;