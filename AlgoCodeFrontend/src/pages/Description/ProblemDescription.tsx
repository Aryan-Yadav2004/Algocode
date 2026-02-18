import { useState, useEffect, DragEvent } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useParams } from 'react-router-dom';
import "../../imports/AceBuildImports";
import DOMPurify from 'dompurify';
import { useUser } from "@clerk/clerk-react";

import Languages from '../../constants/Languages';
import Themes from '../../constants/Themes';
import { ProblemData } from '../../types/problem.types';
import { establishSocketConnection, onSubmissionResponse } from '../../utils/socketConnection';

type languageSupport = {
    languageName: string,
    value: string
}

type themeStyle = {
    themeName: string,
    value: string
}

function Description() {

    const [problem, setProblem] = useState<ProblemData | null>(null);
    const { id } = useParams();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState('statement');

    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('');
    const [theme, setTheme] = useState('monokai');
    const [submissions, setSubmissions] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    useEffect(() => {
        async function fetchProblem() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_PROBLEM_SERVICE_BASE_URL}/api/v1/problems/${id}`);
                console.log(response);
                if (response.data && response.data.data) {
                    const problem = response.data.data;
                    setProblem(problem);
                    const starterCodeStub = problem.codeStubs.find((stub: any) => stub.language.toLowerCase() === language.toLowerCase());
                    if (starterCodeStub) {
                        setCode(starterCodeStub.userSnippet);
                    } else {
                        // Fallback if no matching stub found or default to first one
                        const defaultStub = problem.codeStubs[0];
                        if (defaultStub) {
                            setCode(defaultStub.userSnippet);
                            // Map stub language back to editor mode if possible, or keep default
                            if (defaultStub.language === 'CPP') setLanguage('cpp');
                            if (defaultStub.language === 'JAVA') setLanguage('java');
                            if (defaultStub.language === 'PYTHON') setLanguage('python');
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchProblem();
    }, [id]);

    useEffect(() => {
        if (problem && problem.codeStubs) {
            // Map editor value (c_cpp, java, python) to backend language enum (CPP, JAVA, PYTHON)
            const langMap: Record<string, string> = {
                'cpp': 'CPP',
                'java': 'JAVA',
                'python': 'PYTHON'
            };
            const backendLang = langMap[language] || language.toUpperCase();
            const stub = problem.codeStubs.find((stub: any) => stub.language === backendLang);
            if (stub) {
                setCode(stub.userSnippet);
            }
        }
    }, [language, problem]);

    useEffect(() => {
        async function fetchSubmissions() {
            if (activeTab === 'submissions' && user) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_SUBMISSION_SERVICE_BASE_URL}/api/v1/submission`, {
                        params: {
                            userId: user.id,
                            problemId: id
                        }
                    });
                    console.log(response);
                    establishSocketConnection(user.id);
                    if (response.data && response.data.data) {
                        setSubmissions(response.data.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch submissions", error);
                }
            }
        }
        fetchSubmissions();
    }, [activeTab, user, id]);

    const markdownText = activeTab === 'editorial' ? (problem?.editorial || "## No editorial available") : problem?.description;
    const sanitizedMarkdown = DOMPurify.sanitize(markdownText || "");


    async function handleSubmission() {
        if (!user) return;
        try {
            console.log(code)
            console.log(language)
            const response = await axios.post(`${import.meta.env.VITE_SUBMISSION_SERVICE_BASE_URL}/api/v1/submission`, {
                code,
                language,
                userId: user.id,
                problemId: id
            });
            console.log(response);
            establishSocketConnection(user.id);
            setProcessing(true);
            setSubmissionResult(null);
            setIsConsoleOpen(true);

            onSubmissionResponse((data: any) => {
                console.log("Received submission response:", data);
                setProcessing(false);
                setSubmissionResult(data);
            });

            // Optionally refresh submissions after successful submission
            if (activeTab === 'submissions') {
                // re-fetch logic could go here or simply switching tab might trigger it
            }
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    const startDragging = (e: DragEvent<HTMLDivElement>) => {
        setIsDragging(true);
        e.preventDefault();
    }

    const stopDragging = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    }

    const onDrag = (e: DragEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if (newLeftWidth > 10 && newLeftWidth < 90) {
            setLeftWidth(newLeftWidth);
        }

    }

    const isActiveTab = (tabName: string) => {
        if (activeTab === tabName) {
            return 'tab tab-active';
        } else {
            return 'tab'
        }
    }

    return (
        <div
            className='flex w-screen h-[calc(100vh-57px)]'
            onMouseMove={onDrag}
            onMouseUp={stopDragging}

        >

            <div className='leftPanel h-full overflow-auto' style={{ width: `${leftWidth}%` }}>

                <div role="tablist" className="tabs tabs-boxed w-3/5">
                    <a onClick={() => setActiveTab('statement')} role="tab" className={isActiveTab("statement")}>Problem Statement</a>
                    <a onClick={() => setActiveTab('editorial')} role="tab" className={isActiveTab("editorial")}>Editorial</a>
                    {user && <a onClick={() => setActiveTab('submissions')} role="tab" className={isActiveTab("submissions")}>Submissions</a>}
                </div>

                <div className='markdownViewer p-[20px] basis-1/2'>
                    {activeTab === 'submissions' ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Language</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission: any, index) => (
                                        <tr key={index}>
                                            <td>{submission.status || 'Pending'}</td>
                                            <td>{submission.language}</td>
                                            <td>{new Date(submission.createdAt || Date.now()).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {submissions.length === 0 && <p className="text-center mt-4">No submissions yet.</p>}
                        </div>
                    ) : (
                        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose">
                            {sanitizedMarkdown}
                        </ReactMarkdown>
                    )}
                </div>


            </div>

            <div className='divider cursor-col-resize w-[5px] bg-slate-200 h-full' onMouseDown={startDragging}></div>

            <div className='rightPanel h-full overflow-auto flex flex-col' style={{ width: `${100 - leftWidth}%` }}>

                <div className='flex gap-x-1.5 justify-start items-center px-4 py-2 basis-[5%]'>
                    <div>
                        {user && <button className="btn btn-success btn-sm" onClick={handleSubmission}>Submit</button>}
                    </div>

                    <div>
                        <select
                            className="select select-info w-full select-sm max-w-xs"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >

                            {Languages.map((language: languageSupport) => (
                                <option key={language.value} value={language.value}> {language.languageName} </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            className="select select-info w-full select-sm max-w-xs"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            {Themes.map((theme: themeStyle) => (
                                <option key={theme.value} value={theme.value}> {theme.themeName} </option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="flex flex-col editor-console grow-[1] ">

                    <div className='editorContainer grow-[1]'>
                        <AceEditor
                            mode={language === 'cpp' ? 'c_cpp' : language}
                            theme={theme}
                            value={code}
                            onChange={(e: string) => setCode(e)}
                            name='codeEditor'
                            className='editor'
                            style={{ width: '100%' }}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                showLineNumbers: true,
                                fontSize: 16
                            }}
                            height='100%'
                        />
                    </div>



                </div>

                {/* Console / Result Panel */}
                {isConsoleOpen && (
                    <div className='console-panel bg-base-200 border-t-2 border-slate-300 p-4 shrink-0 overflow-y-auto' style={{ height: '30%', minHeight: '150px' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg">Console</h3>
                            <button
                                className="btn btn-xs btn-circle btn-ghost"
                                onClick={() => setIsConsoleOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {processing ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="loading loading-spinner loading-lg"></span>
                                <p className="mt-2 text-sm text-gray-500">Processing submission...</p>
                            </div>
                        ) : submissionResult ? (
                            <div className="w-full">
                                <div className={`alert ${submissionResult.status === 'SUCCESS' ? 'alert-success' : 'alert-error'} mb-4 shadow-lg`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={submissionResult.status === 'SUCCESS' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                                    <div>
                                        <h3 className="font-bold">{submissionResult.status}</h3>
                                        <div className="text-xs">Submission ID: {submissionResult.submissionId}</div>
                                    </div>
                                </div>

                                {submissionResult.output && (
                                    <div className="mockup-code bg-base-300 text-base-content w-full">
                                        <pre data-prefix="$"><code>Result Output:</code></pre>
                                        <pre className={`whitespace-pre-wrap px-5 py-2 ${submissionResult.status === 'SUCCESS' ? 'text-success' : 'text-error'}`}>
                                            {submissionResult.output}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Run or Submit code to see results here.</p>
                        )}
                    </div>
                )}

            </div>

        </div>
    )
}

export default Description;
