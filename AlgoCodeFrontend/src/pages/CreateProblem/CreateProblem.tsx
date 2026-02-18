import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

type TestCase = {
    input: string;
    output: string;
};

type CodeStub = {
    language: string;
    startSnippet: string;
    endSnippet: string;
    userSnippet: string;
};

function CreateProblem() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editorial, setEditorial] = useState('');
    const [difficulty, setDifficulty] = useState('easy');
    const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', output: '' }]);
    const [codeStubs, setCodeStubs] = useState<CodeStub[]>([{ language: 'CPP', startSnippet: '', endSnippet: '', userSnippet: '' }]);
    const navigate = useNavigate();

    // UI State for previews
    const [isPreviewDescription, setIsPreviewDescription] = useState(false);
    const [isPreviewEditorial, setIsPreviewEditorial] = useState(false);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const handleRemoveTestCase = (index: number) => {
        const newTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(newTestCases);
    };

    const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const handleAddCodeStub = () => {
        setCodeStubs([...codeStubs, { language: 'CPP', startSnippet: '', endSnippet: '', userSnippet: '' }]);
    };

    const handleRemoveCodeStub = (index: number) => {
        const newCodeStubs = codeStubs.filter((_, i) => i !== index);
        setCodeStubs(newCodeStubs);
    };

    const handleCodeStubChange = (index: number, field: keyof CodeStub, value: string) => {
        const newCodeStubs = [...codeStubs];
        newCodeStubs[index][field] = value;
        setCodeStubs(newCodeStubs);
    };

    const handleSubmit = async () => {
        const problemData = {
            title,
            description,
            difficulty,
            testCases,
            codeStubs,
            editorial
        };

        console.log("Problem Data Payload:", JSON.stringify(problemData, null, 2));

        try {
            const response = await axios.post(`${import.meta.env.VITE_PROBLEM_SERVICE_BASE_URL}/api/v1/problems`, problemData);
            console.log("Problem created successfully:", response.data);
            alert("Problem created successfully!");
            navigate('/problems');
        } catch (error) {
            console.error("Error creating problem:", error);
            alert("Error creating problem");
        }
    };

    return (
        <>
            <SignedIn>
                <div className="container mx-auto p-4 mb-20 h-[calc(100vh-55px)] overflow-y-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center text-primary">Create New Problem</h1>

                    <div className="form-control w-full mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">Problem Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Knight Probability in Chessboard"
                            className="input input-bordered w-full"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-control w-full mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">Difficulty</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={difficulty}
                            onChange={(e) => { setDifficulty(e.target.value); console.log(e.target.value) }}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {/* Description Section */}
                    <div className="form-control w-full mb-6">
                        <label className="label cursor-pointer justify-start gap-4">
                            <span className="label-text font-semibold">Description (Markdown Supported)</span>
                            <span className="label-text-alt text-info">Images can be inserted using standard Markdown: ![alt](url)</span>
                            <input type="checkbox" className="toggle toggle-sm" checked={isPreviewDescription} onChange={() => setIsPreviewDescription(!isPreviewDescription)} />
                            <span className="label-text text-sm">Preview</span>
                        </label>

                        {isPreviewDescription ? (
                            <div className="min-h-[200px] p-4 bg-base-200 rounded-lg prose max-w-none">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{description}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                className="textarea textarea-bordered h-64 font-mono"
                                placeholder="Describe the problem here..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        )}
                    </div>

                    {/* Editorial Section */}
                    <div className="form-control w-full mb-6">
                        <label className="label cursor-pointer justify-start gap-4">
                            <span className="label-text font-semibold">Editorial (Markdown Supported)</span>
                            <input type="checkbox" className="toggle toggle-sm" checked={isPreviewEditorial} onChange={() => setIsPreviewEditorial(!isPreviewEditorial)} />
                            <span className="label-text text-sm">Preview</span>
                        </label>
                        {isPreviewEditorial ? (
                            <div className="min-h-[200px] p-4 bg-base-200 rounded-lg prose max-w-none">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{editorial}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                className="textarea textarea-bordered h-64 font-mono"
                                placeholder="Explain the solution here..."
                                value={editorial}
                                onChange={(e) => setEditorial(e.target.value)}
                            ></textarea>
                        )}
                    </div>

                    {/* Test Cases */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">Test Cases</h3>
                        {testCases.map((tc, index) => (
                            <div key={index} className="flex gap-4 mb-2 items-start">
                                <div className="flex-1">
                                    <textarea
                                        className="textarea textarea-bordered w-full h-24 font-mono"
                                        placeholder="Input"
                                        value={tc.input}
                                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        className="textarea textarea-bordered w-full h-24 font-mono"
                                        placeholder="Output"
                                        value={tc.output}
                                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                    ></textarea>
                                </div>
                                <button className="btn btn-error btn-square btn-sm mt-8" onClick={() => handleRemoveTestCase(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        <button className="btn btn-sm btn-outline" onClick={handleAddTestCase}>+ Add Test Case</button>
                    </div>

                    {/* Code Stubs */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-2">Code Stubs</h3>
                        {codeStubs.map((stub, index) => (
                            <div key={index} className="card bg-base-200 shadow-sm p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <select
                                        className="select select-bordered select-sm w-full max-w-xs"
                                        value={stub.language}
                                        onChange={(e) => handleCodeStubChange(index, 'language', e.target.value)}
                                    >
                                        <option value="CPP">C++ (CPP)</option>
                                        <option value="JAVA">Java</option>
                                        <option value="PYTHON">Python</option>
                                    </select>
                                    <button className="btn btn-ghost btn-xs text-error" onClick={() => handleRemoveCodeStub(index)}>Remove Stub</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text-alt">Start Snippet</span></label>
                                        <textarea
                                            className="textarea textarea-bordered font-mono text-xs h-32"
                                            value={stub.startSnippet}
                                            onChange={(e) => handleCodeStubChange(index, 'startSnippet', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text-alt">User Snippet</span></label>
                                        <textarea
                                            className="textarea textarea-bordered font-mono text-xs h-32"
                                            value={stub.userSnippet}
                                            onChange={(e) => handleCodeStubChange(index, 'userSnippet', e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text-alt">End Snippet</span></label>
                                        <textarea
                                            className="textarea textarea-bordered font-mono text-xs h-32"
                                            value={stub.endSnippet}
                                            onChange={(e) => handleCodeStubChange(index, 'endSnippet', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="btn btn-sm btn-outline" onClick={handleAddCodeStub}>+ Add Code Stub</button>
                    </div>

                    <div className="divider"></div>

                    <div className="flex justify-end">
                        <button className="btn btn-primary btn-wide" onClick={handleSubmit}>Create Problem</button>
                    </div>

                </div>
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}

export default CreateProblem;
