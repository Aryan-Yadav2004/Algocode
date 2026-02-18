import mongoose from "mongoose";
import { ATLAS_DB_URL, NODE_ENV } from "./server.config.js";

async function connnectToBD() {
    try {
       if(NODE_ENV === "development"){
            await mongoose.connect(ATLAS_DB_URL);
       }
       else {
            await mongoose.connect("someother rl");
       }
    } catch (error) {
        console.log("unable to connect to the DB server");
        console.log(error);
    }
}
export default connnectToBD;