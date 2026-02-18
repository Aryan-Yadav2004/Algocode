import { useEffect, useState } from "react";
import axios from "axios";
import CollapsibleTopicProblem from "./CollapsibleTopicProblems";
import { ProblemData } from "../../types/problem.types";

import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function ProblemList() {
    const [problems, setProblems] = useState<ProblemData[]>([]);
    const { user } = useUser();

    useEffect(() => {
        async function fetchProblems() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_PROBLEM_SERVICE_BASE_URL}/api/v1/problems`);
                console.log(response.data);
                if (response.data && response.data.data) {
                    setProblems(response.data.data);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchProblems();
    }, []);

    return (
        <div className="flex justify-center items-center w-[100vw] relative">
            <div className="topic-list flex flex-col w-[60%]">
                {problems.length > 0 && <CollapsibleTopicProblem topicName="All Problems" problems={problems} />}
            </div>

            {user && (
                <Link to="/problem/create" className="btn btn-circle btn-primary fixed bottom-10 right-10 shadow-lg text-2xl">
                    +
                </Link>
            )}
        </div>
    )
}

export default ProblemList;