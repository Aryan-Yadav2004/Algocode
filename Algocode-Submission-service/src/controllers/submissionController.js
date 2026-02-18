// TODO: Add validation layer
async function createSubmission(req, res) {
    // console.log("controller",req.body)
    const response = await this.submissionService.addSubmission(req.body);
    return res.code(201).send({
        error: {},
        data: response,
        success: true,
        message: 'created submission successfully'
    });
};

async function getSubmissionsForProblemForUser(req, res) {
    console.log(req.query);
    const response = await this.submissionService.getSubmissionForProblemForUser(req.query);
    console.log(response);
    return res.code(201).send({
        error: {},
        data: response,
        success: true,
        message: "successfully fetched summision for particular user"
    });
}

export { createSubmission, getSubmissionsForProblemForUser};