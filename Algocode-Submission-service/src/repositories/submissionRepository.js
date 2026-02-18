import Submission from "../models/submissionModel.js";

class SubmissionRepository {
    constructor() {
        this.submissionModel = Submission;
    }

    async createSubmission(submission) {
        // console.log("repository", submission);
        const response = await this.submissionModel.create(submission);
        return response;
    }

    async updateSubmissionStatus (submission){
        const response = await this.submissionModel.findOneAndUpdate({_id: submission.submissionId}, {$set: {status: submission.status}});
        // console.log(response);
        return submission;
    }

    async getSubmissionsForProblemForUser ({userId, problemId}){
        const response = await this.submissionModel.find({userId, problemId});
        return response;
    }
}

export default SubmissionRepository;