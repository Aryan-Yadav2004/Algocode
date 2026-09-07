import mongoose from "mongoose";
import { ATLAS_DB_URL, NODE_ENV } from "./server.config.js";

async function connnectToBD() {
    try {
        if (ATLAS_DB_URL) {
            await mongoose.connect(ATLAS_DB_URL);
            console.log("Connected to MongoDB successfully");
        } else {
            console.error("ATLAS_DB_URL is not defined in environment variables");
        }
    } catch (error) {
        console.log("unable to connect to the DB server");
        console.log(error);
    }
}
export default connnectToBD;