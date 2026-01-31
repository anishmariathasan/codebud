/**
 * Mock API responses for offline development
 * Returns realistic fake data so the UI works without the VS Code extension
 */

import type {
    CodeContext,
    DiagnosticsResponse,
    InsertCodeResponse,
    SwitchModeResponse,
    ExtensionStatus,
} from './types';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock code context - a Python fibonacci function
 */
export async function getMockContext(): Promise<CodeContext> {
    await delay(100);
    return {
        mode: 'navigator',
        fileName: 'fibonacci.py',
        language: 'python',
        fileContent: `def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)

def main():
    # Print first 10 Fibonacci numbers
    for i in range(10):
        print(f"F({i}) = {fibonacci(i)}")

if __name__ == "__main__":
    main()
`,
        surroundingCode: `def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)

def main():
    # Print first 10 Fibonacci numbers
    for i in range(10):
        print(f"F({i}) = {fibonacci(i)}")`,
        cursorLine: 5,
        totalLines: 16,
        selectedText: null,
        recentChanges: [
            'return fibonacci(n - 1) + fibonacci(n - 2)',
            '# Print first 10 Fibonacci numbers',
        ],
    };
}

/**
 * Mock diagnostics - some realistic errors
 */
export async function getMockDiagnostics(): Promise<DiagnosticsResponse> {
    await delay(80);
    return {
        errors: [
            {
                line: 3,
                endLine: 3,
                message: "Undefined variable 'undefined_var'",
                severity: 'error',
                source: 'pylint',
            },
            {
                line: 8,
                endLine: 8,
                message: 'Missing return statement in recursive case',
                severity: 'warning',
                source: 'pylint',
            },
        ],
    };
}

/**
 * Mock insert code response
 */
export async function mockInsertCode(
    _line: number,
    _code: string
): Promise<InsertCodeResponse> {
    await delay(200);
    return { success: true };
}

/**
 * Mock switch mode response
 */
export async function mockSwitchMode(
    mode: 'driver' | 'navigator'
): Promise<SwitchModeResponse> {
    await delay(100);
    return { success: true, mode };
}

/**
 * Mock extension status
 */
export async function getMockStatus(): Promise<ExtensionStatus> {
    await delay(50);
    return { active: true, mode: 'navigator' };
}
