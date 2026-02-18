import NotImplemented from '../errors/notImplemented.error.js';
import { ProblemService } from '../services/index.js'
import { ProblemRepository } from '../repositories/index.js';
import { StatusCodes } from 'http-status-codes';

const problemService = new ProblemService(new ProblemRepository());

function pingProblemController(req,res) {
    return res.json({message: 'Ping controller is up'});
}

async function addProblem(req, res, next){
    try {
        console.log("incoming req body",  req.body);
        const newproblem = await problemService.createProblem(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Successfully created a new problem",
            error: {},
            data: newproblem
        })
    } catch (error) {
        next(error);
    }
}

async function getProblem(req, res, next) {
    try {
        const problem = await problemService.getProblem(req.params.id);
        return res.status(StatusCodes.OK).json({success: true, error: {}, message: "Successfully fetched problem with given id", data: problem})
    } catch (error) {
        next(error);
    }
}

async function getProblems(req, res, next) {
    try {
        const problems = await problemService.getAllProblems();
        return  res.status(StatusCodes.CREATED).json({success: true, message: 'Succesfully fetched all the problems', error: {}, data: problems});
    } catch (error) {
        next(error);
    }
}

async function deleteProblem(req, res, next) {
    try {
        const { id } = req.params;
        const problem = await problemService.deleteProblem(id);
        return res.status(StatusCodes.OK).json({success: true, message: 'Successfully deleted problem', error: {}, data: problem});
    } catch (error) {
        next(error);
    }
}

async function updateProblem(req, res, next) {
    try {
        const { id } = req.params;
        const problemData = req.body;
        const problem = await problemService.updateProblem(id,problemData);
        return res.status(StatusCodes.OK).json({success: true, message: `Succesfully updated problem with id: ${id}`, error: {}, data: problem});
    } catch (error) {
        next(error);
    }
} 

export { pingProblemController, addProblem, getProblem, getProblems, deleteProblem, updateProblem }