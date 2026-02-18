import BaseError from "./base.error.js";
import { StatusCodes } from "http-status-codes";

class NotImplemented extends BaseError {
    constructor(methodName){
        super("UnImplemented", StatusCodes.NOT_IMPLEMENTED, `${methodName} Not Implemented`, {});
    }
}
export default NotImplemented;