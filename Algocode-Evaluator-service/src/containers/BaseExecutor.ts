import logger from '../config/logger.config.js';
import type CodeExecutorStrategy from '../types/CodeExecutorStrategy.js';
import type { ExecutionResponse, TestCase, TestCaseResult } from '../types/CodeExecutorStrategy.js';
import createContainer from './containerFactory.js';
import { runExec,writeFileToContainer } from './dockerHelper.js';

type ExecResult = { stdout: string; stderr: string; exitCode: number };

/**
 * BaseExecutor — abstract base class for all language executors.
 *
 * Contains the ENTIRE shared lifecycle:
 *  1. Create container (kept alive via 'sleep infinity')
 *  2. Write source file via putArchive (no shell injection)
 *  3. Optionally compile once (if getCompileCommand() returns non-null)
 *  4. Run each test case via exec(), compare output
 *  5. Kill + remove container in finally block (always runs)
 *
 * Subclasses declare ONLY what differs per language:
 *  - imageName        → the Docker image to use
 *  - sourceFileName   → e.g. 'main.cpp', 'Main.java', 'test.py'
 *  - tleLimitMs       → per-test-case timeout from tle.config.ts
 *  - getCompileCommand() → compile step, or null for interpreted languages
 *  - getRunCommand()     → command to execute the program
 *  - classifyStderr()    → optional: override for language-specific error mapping
 *                          (e.g. Java maps OutOfMemoryError → MLE instead of RE)
 *
 * To add a new language (Go, Rust, JS...):
 *  1. Create a new file extending BaseExecutor (~15 lines)
 *  2. Add one line in ExecutorFactory.ts
 *  Done — no other changes needed.
 */
abstract class BaseExecutor implements CodeExecutorStrategy {
    // ── Subclasses MUST declare these ────────────────────────────────────────
    abstract readonly imageName: string;
    abstract readonly sourceFileName: string;
    abstract readonly tleLimitMs: number;

    /** Returns the compile command as a string array, or null if no compile step. */
    abstract getCompileCommand(): string[] | null;

    /** Returns the command used to run the program (after optional compilation). */
    abstract getRunCommand(): string[];

    /**
     * Language-specific stderr classification.
     * Default: any stderr → RE (Runtime Error).
     * Override in subclasses for language-specific signals (e.g. Java OOM → MLE).
     */
    protected classifyStderr(
        stderr: string,
        testCaseIndex: number,
        expected: string,
    ): TestCaseResult {
        return { testCaseIndex, status: 'RE', output: stderr, expected };
    }

    // ── Shared execution lifecycle — subclasses do NOT override this ─────────
    async execute(
        code: string,
        testCases: TestCase[],
        userId: string,
        submissionId: string,
    ): Promise<ExecutionResponse> {
        const name = this.constructor.name;

        // Container runs 'sleep infinity' to stay alive for multiple exec() calls.
        // One container per submission — not one per test case.
        const container = await createContainer(this.imageName, ['sleep', 'infinity']);
        await container.start();
        logger.info(`[${name}] Container started — submissionId: ${submissionId}`);

        try {
            // ── Step 1: Inject source file (safe: no shell, no injection) ────
            await writeFileToContainer(container, this.sourceFileName, code, '/sandbox');

            // ── Step 2: Compile once (skip for interpreted languages) ─────────
            const compileCmd = this.getCompileCommand();
            if (compileCmd !== null) {
                const compileResult = await runExec(
                    container,
                    compileCmd,
                    60_000, // 60s compile timeout — generous for cold JVM / slow g++
                    '/sandbox',
                );

                if (compileResult.stderr) {
                    logger.error(`[${name}] Compile error: ${compileResult.stderr}`);
                    return {
                        status: 'RE',
                        failedTestCase: {
                            testCaseIndex: -1, // -1 = compile-time failure, not a test case
                            status: 'RE',
                            output: compileResult.stderr,
                            expected: '',
                        },
                        output: compileResult.stderr,
                        expected: '',
                        userId,
                        submissionId,
                    };
                }

                logger.info(`[${name}] Compiled successfully — running ${testCases.length} test case(s)`);
            } else {
                logger.info(`[${name}] Script ready — running ${testCases.length} test case(s)`);
            }

            // ── Step 3: Run each test case ────────────────────────────────────
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                if (!testCase) continue;

                // Write test case input to /sandbox/input.txt safely via putArchive
                await writeFileToContainer(container, 'input.txt', (testCase.input ?? '') + '\n', '/sandbox');

                let result: ExecResult;
                try {
                    // Redirect stdin from input.txt — prevents premature socket close on Docker hijack
                    const runCmd = ['sh', '-c', `${this.getRunCommand().join(' ')} < input.txt`];
                    result = await runExec(
                        container,
                        runCmd,
                        this.tleLimitMs,
                        '/sandbox',
                    );
                } catch (err) {
                    if (err === 'TLE') {
                        logger.info(`[${name}] TLE on test case ${i}`);
                        return {
                            status: 'TLE',
                            failedTestCase: {
                                testCaseIndex: i,
                                status: 'TLE',
                                output: '',
                                expected: testCase.output,
                            },
                            output: '',
                            expected: testCase.output,
                            userId,
                            submissionId,
                        };
                    }
                    throw err; // unexpected error — let it propagate
                }

                // Runtime error — stderr has output
                if (result.stderr) {
                    const failedCase = this.classifyStderr(result.stderr, i, testCase.output);
                    logger.info(`[${name}] ${failedCase.status} on test case ${i}: ${result.stderr}`);
                    return {
                        status: failedCase.status,
                        failedTestCase: failedCase,
                        output: failedCase.output,
                        expected: failedCase.expected,
                        userId,
                        submissionId,
                    };
                }

                // Wrong answer
                if (result.stdout.trim() !== testCase.output.trim()) {
                    logger.info(`[${name}] WA on test case ${i}`);
                    return {
                        status: 'WA',
                        failedTestCase: {
                            testCaseIndex: i,
                            status: 'WA',
                            output: result.stdout,
                            expected: testCase.output,
                        },
                        output: result.stdout,
                        expected: testCase.output,
                        userId,
                        submissionId,
                    };
                }

                logger.info(`[${name}] Test case ${i} passed ✓`);
            }

            return { status: 'SUCCESS', userId, submissionId };

        } finally {
            // Always clean up — even if an unexpected error was thrown above.
            // Without this, failed submissions would leave orphaned containers.
            try {
                await container.kill();
            } catch {
                // Container may have already exited — safe to ignore
            }
            await container.remove({ force: true });
            logger.info(`[${name}] Container removed — submissionId: ${submissionId}`);
        }
    }
}

export default BaseExecutor;
