import SubmissionRepository from "../repositories/submissionRepository.js";
import SubmissionService from "../services/submissionService.js";

export default class EvaluatorJob{
    name;
    payload;
    
    constructor(payload){
        this.payload = payload;
        this.name = this.constructor.name; 
    }

    async handle () {
        console.log("evaluator handler called");
        const submissionServiceInstance = new SubmissionService(new SubmissionRepository());
        await submissionServiceInstance.updateSubmissionStatus(this.payload);
        console.log(this.payload);
        await fetch("http://localhost:3004/sendPayload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.payload), // Convert body to JSON string
        });
    }
}