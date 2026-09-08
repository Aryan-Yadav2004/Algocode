import { useEffect, useState } from "react";
import axios from "axios";
import CollapsibleTopicProblem from "./CollapsibleTopicProblems";
import { ProblemData } from "../../types/problem.types";

import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function ProblemList() {
    const [problems, setProblems] = useState<ProblemData[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        async function fetchProblems() {
            try {
                const baseUrl = import.meta.env.VITE_PROBLEM_SERVICE_BASE_URL || '';
                const response = await axios.get(`${baseUrl}/api/v1/problems`);
                console.log("Fetched problems:", response.data);
                if (response.data && response.data.data) {
                    setProblems(response.data.data);
                }
            } catch (e) {
                console.error("Failed to fetch problems:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchProblems();
    }, []);

    return (
        <div className="flex justify-center items-center w-[100vw] min-h-[calc(100vh-55px)] relative py-8">
            <div className="topic-list flex flex-col w-[80%] max-w-4xl">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-4 text-base-content/70">Loading problems...</p>
                    </div>
                ) : problems.length > 0 ? (
                    <CollapsibleTopicProblem topicName="All Problems" problems={problems} />
                ) : (
                    <div className="text-center py-20 bg-base-200 rounded-xl">
                        <h3 className="text-xl font-bold mb-2">No problems found</h3>
                        <p className="text-base-content/70 mb-4">No problems have been created yet or unable to reach API.</p>
                        {user && (
                            <Link to="/problem/create" className="btn btn-primary btn-sm">
                                Create First Problem
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {user && (
                <Link to="/problem/create" className="btn btn-circle btn-primary fixed bottom-10 right-10 shadow-lg text-2xl">
                    +
                </Link>
            )}
        </div>
    );
}

export default ProblemList;