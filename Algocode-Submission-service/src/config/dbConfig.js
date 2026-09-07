import mongoose from "mongoose";
import { ATLAS_DB_URL, NODE_ENV } from "./serverConfig.js";

async function connnectToDB() {
    try {
        if (ATLAS_DB_URL) {
            await mongoose.connect(ATLAS_DB_URL);
            console.log("Connected to DB successfully");
        } else {
            console.error("ATLAS_DB_URL is not defined in environment variables");
        }
    } catch (error) {
        console.log("unable to connect to the DB server");
        console.log(error);
    }
}
export default connnectToDB;