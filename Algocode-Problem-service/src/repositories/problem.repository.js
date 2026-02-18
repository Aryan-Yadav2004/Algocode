import logger from "../config/logger.config.js";
import NotFound from "../errors/notFound.error.js";
import { Problem } from "../models/index.js";

class ProblemRepository {
    async createProblem (problemData) {
        try {
            const problem = await Problem.create({
                title: problemData.title,
                description: problemData.description,
                codeStubs: problemData.codeStubs,
                testCases: (problemData.testCases)? problemData.testCases:[],
                editorial: problemData.editorial,
                difficulty: problemData.difficulty,
            });
            return problem;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async  getAllProblems(){
        try {
            const problems = await Problem.find({});
            return problems;
        } catch (error) {
            console.log(error);
            throw error;
        }
    } 
    async getProblem(id){
        try {
            const problem = await Problem.findById(id);
            if(!problem){
                throw new NotFound("Problem", id);
            }
            return problem;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateProblem(id, problemData) {
        try {
            const problem = await Problem.findOneAndUpdate({_id: id},{
                title: problemData.title,
                description: problemData.description,
                testCases: (problemData.testCases)? problemData.testCases:[]
            });
            if(!problem) throw new NotFound("Problem", id);
            return problem;
        }  catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteProblem(id){
        try {
            const problem = await Problem.findByIdAndDelete(id);
            if(!problem) {
                logger.error(`Problem with id: ${id} not found in the db`);
                throw new NotFound("Problem", id);
            };
            return problem;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default ProblemRepository;