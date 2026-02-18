import { Link } from "react-router-dom";
import { ProblemData } from "../../types/problem.types";

function CollapsibleTopicProblems({ topicName, problems }: { topicName: string, problems: ProblemData[] }) {

    return (
        <div className="collapse collapse-arrow bg-base-200 my-4 border border-base-300">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl font-medium">
                {topicName}
            </div>
            <div className="collapse-content">
                <div className="overflow-x-auto">
                    <table className="table">
                        {/* head */}
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Title</th>
                                <th>Difficulty</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((problem) => (
                                <tr key={problem._id} className="hover">
                                    <th>
                                        <label>
                                            <input type="checkbox" className="checkbox" disabled />
                                        </label>
                                    </th>
                                    <td>
                                        <Link to={`/problems/${problem._id}`} className="link link-hover font-bold">
                                            {problem.title}
                                        </Link>
                                    </td>
                                    <td>
                                        <div className={`badge ${problem.difficulty === 'easy' ? 'badge-success' : problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'} gap-2`}>
                                            {problem.difficulty}
                                        </div>
                                    </td>
                                    <th>
                                        <Link to={`/problems/${problem._id}`} className="btn btn-ghost btn-xs">Solve</Link>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CollapsibleTopicProblems;
