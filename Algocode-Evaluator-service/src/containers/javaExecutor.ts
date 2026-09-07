import { TLE_LIMITS_MS } from '../config/tle.config.js';
import type { TestCaseResult } from '../types/CodeExecutorStrategy.js';
import { JAVA_IMAGE } from '../utils/constanst.js';
import BaseExecutor from './BaseExecutor.js';

/**
 * JavaExecutor — Java execution strategy.
 *
 * Lifecycle (handled entirely by BaseExecutor):
 *  1. Container started with 'sleep infinity'
 *  2. Main.java written via putArchive (no shell injection)
 *  3. Compiled ONCE: javac Main.java (60s timeout — JVM cold start)
 *  4. Each test case: exec java Main with stdin piped
 *  5. Container killed + removed in finally
 *
 * TLE note:
 *  Java JVM startup alone takes ~300-500ms. tleLimitMs is set to 10s
 *  to avoid false TLEs on valid solutions (old value was 2000ms — too low).
 *
 * Java-specific: overrides classifyStderr to map OutOfMemoryError → MLE
 *  instead of the default RE, giving the user a more accurate verdict.
 */
class JavaExecutor extends BaseExecutor {
    readonly imageName      = JAVA_IMAGE;
    readonly sourceFileName = 'Main.java';
    readonly tleLimitMs     = TLE_LIMITS_MS['JAVA'] ?? 10000;

    getCompileCommand(): string[] {
        return ['javac', 'Main.java'];
    }

    getRunCommand(): string[] {
        return ['java', 'Main'];
    }

    /**
     * Java-specific stderr classification.
     * OutOfMemoryError signals the JVM was killed by the OS/Docker for
     * exceeding the 256MB memory limit → report as MLE, not generic RE.
     */
    protected classifyStderr(
        stderr: string,
        testCaseIndex: number,
        expected: string,
    ): TestCaseResult {
        if (stderr.includes('OutOfMemoryError')) {
            return { testCaseIndex, status: 'MLE', output: stderr, expected };
        }
        return { testCaseIndex, status: 'RE', output: stderr, expected };
    }
}

export default JavaExecutor;