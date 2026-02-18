import { StatusCodes } from "http-status-codes";
import BaseError from "./baseError.js";

class NotImplemented extends BaseError{
    constructor(methodName) {
        super("UnImplemented", StatusCodes.NOT_IMPLEMENTED, `${methodName} is currently not implemented`, {});
    }
};

export default NotImplemented;