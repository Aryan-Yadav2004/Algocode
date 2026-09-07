import { TLE_LIMITS_MS } from '../config/tle.config.js';
import { PYTHON_IMAGE } from '../utils/constanst.js';
import BaseExecutor from './BaseExecutor.js';

/**
 * PythonExecutor — Python execution strategy.
 *
 * Lifecycle (handled entirely by BaseExecutor):
 *  1. Container started with 'sleep infinity'
 *  2. test.py written via putArchive (no shell injection)
 *  3. No compile step (Python is interpreted)
 *  4. Each test case: exec python3 test.py with stdin piped
 *  5. Container killed + removed in finally
 *
 * getCompileCommand() returns null → BaseExecutor skips the compile step entirely.
 */
class PythonExecutor extends BaseExecutor {
    readonly imageName      = PYTHON_IMAGE;
    readonly sourceFileName = 'test.py';
    readonly tleLimitMs     = TLE_LIMITS_MS['PYTHON'] ?? 8000;

    getCompileCommand(): null {
        return null; // Python is interpreted — no compile step needed
    }

    getRunCommand(): string[] {
        return ['python3', 'test.py'];
    }
}

export default PythonExecutor;