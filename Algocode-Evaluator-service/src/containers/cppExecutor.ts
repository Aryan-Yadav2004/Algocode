import { TLE_LIMITS_MS } from '../config/tle.config.js';
import { CPP_IMAGE } from '../utils/constanst.js';
import BaseExecutor from './BaseExecutor.js';

/**
 * CppExecutor — C++ execution strategy.
 *
 * Lifecycle (handled entirely by BaseExecutor):
 *  1. Container started with 'sleep infinity'
 *  2. main.cpp written via putArchive (no shell injection)
 *  3. Compiled ONCE: g++ main.cpp -o main -O2
 *  4. Each test case: exec ./main with stdin piped
 *  5. Container killed + removed in finally
 */
class CppExecutor extends BaseExecutor {
    readonly imageName      = CPP_IMAGE;
    readonly sourceFileName = 'main.cpp';
    readonly tleLimitMs     = TLE_LIMITS_MS['CPP'] ?? 5000;

    getCompileCommand(): string[] {
        return ['g++', 'main.cpp', '-o', 'main', '-O2'];
    }

    getRunCommand(): string[] {
        return ['./main'];
    }
}

export default CppExecutor;