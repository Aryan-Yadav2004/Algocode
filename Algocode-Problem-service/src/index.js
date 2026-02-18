import express from "express";
import bodyParser from 'body-parser';
import apiRouter from "./routes/index.js";
import { PORT } from "./config/server.config.js";
import errorHandler from "./utils/errorHandler.js";
import connnectToBD from "./config/db.config.js";
import cors from 'cors'
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());

 
app.use("/api",apiRouter);

app.get("/ping", (req,res) => {
    res.status(200).json({message: "Problem service is alive"});
});


//last middleware if any error comes 
app.use(errorHandler);

app.listen(PORT, async () => {
    console.log("server started at port ",PORT);
    await connnectToBD();
    console.log("successfully connected to DB");
});