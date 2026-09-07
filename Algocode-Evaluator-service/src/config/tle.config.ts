/**
 * Centralised Time Limit Exceeded (TLE) configuration.
 *
 * These values represent the maximum wall-clock time (in milliseconds)
 * allowed per individual test case run for each language.
 *
 * Rationale:
 *  - CPP    : 5s  — compiled binary, fast startup
 *  - JAVA   : 10s — JVM startup alone is ~300-500ms; generous budget needed
 *  - PYTHON : 8s  — interpreted, but problems are not as compute-heavy
 */
export const TLE_LIMITS_MS: Record<string, number> = {
    CPP: 5000,
    JAVA: 10000,
    PYTHON: 8000,
};

export const DEFAULT_TLE_MS = 8000;
