import axiosInstance from "../config/axiosInstance.js";

import { PROBLEM_ADMIN_SERVICE_URL } from "../config/serverConfig.js";

const PROBLEM_ADMIN_API_URL = `${PROBLEM_ADMIN_SERVICE_URL}/api/v1`;

async function fetchProblemDetails(problemId) {
    try {
        const uri = PROBLEM_ADMIN_API_URL + `/problems/${problemId}`;
        const response = await axiosInstance.get(uri);
        return response.data;
    } catch (error) {
        console.log("Something went wrong while fetching problem details");
        console.log(error);
    }
}

export { fetchProblemDetails };