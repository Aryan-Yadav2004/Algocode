import mongoose from "mongoose";
import { ATLAS_DB_URL, NODE_ENV } from "./serverConfig.js";

async function connnectToDB() {
    try {
       if(NODE_ENV === "development"){ 
            await mongoose.connect(ATLAS_DB_URL);
       }
       else {
            await mongoose.connect("someother url");
       }
    } catch (error) {
        console.log("unable to connect to the DB server");
        console.log(error);
    }
}
export default connnectToDB;