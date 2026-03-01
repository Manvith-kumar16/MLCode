const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const crypto = require('crypto');

// Directory for temporary execution files
const TMP_DIR = path.join(__dirname, '../tmp');

// Ensure tmp directory exists
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

/**
 * Builds the Python script string by injecting the user code and test cases.
 */
function buildPythonScript(userCode, testCases) {
    // Generate the exact Python test harness
    // We expect the user's code to define a function that we can call
    // But since ML-Code test cases are often complete print statements or full assertions,
    // we need to see how the Deep-ML tests are structured.

    // Looking at the problem data: "testCases" contains { test: "print(matrix_dot_vector(...))", expected_output: "..." }
    // This means the user code just needs to be prepended, and then we evaluate the `test` statements.

    let script = `
import sys
import json
import traceback
import math
import numpy as np

# 1. Inject User Code
try:
${userCode.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(json.dumps({
        "status": "failed",
        "message": "Compilation / Syntax Error",
        "cases": [],
        "summary": "".join(traceback.format_exception_only(type(e), e)).strip()
    }))
    sys.exit(0)

# 2. Run Test Cases
results = {
    "status": "passed",
    "message": "Executed successfully.",
    "cases": [],
    "summary": ""
}

passed_count = 0
total_count = ${testCases.length}

def run_test_case(name, test_code, expected_string):
    import io
    from contextlib import redirect_stdout
    
    global passed_count
    passed = False
    got_str = ""
    error_msg = ""
    
    try:
        # Capture stdout
        f = io.StringIO()
        with redirect_stdout(f):
            # ML-Code test cases use 'print(func(args))'. We exec it.
            exec(test_code, globals())
            
        got_str = f.getvalue().strip()
        expected_str = str(expected_string).strip()
        
        # Basic string equality for now. Could be improved for floats/arrays
        if got_str == expected_str:
            passed = True
            passed_count += 1
    except Exception as e:
        error_msg = "".join(traceback.format_exception_only(type(e), e)).strip()
        got_str = error_msg
        
    results["cases"].append({
        "name": name,
        "passed": passed,
        "expected": str(expected_string),
        "got": got_str
    })

`;

    // 3. Inject the specific test calls
    testCases.forEach((tc, idx) => {
        // We need to safely escape strings for Python injection
        const safeTest = JSON.stringify(tc.test);
        const safeExpected = JSON.stringify(tc.expected_output);
        script += `run_test_case("Test ${idx + 1}", ${safeTest}, ${safeExpected})\n`;
    });

    script += `
results["summary"] = f"Passed: {passed_count}/{total_count}"
if passed_count < total_count:
    results["status"] = "failed"

print(json.dumps(results))
`;

    return script;
}

/**
 * Executes Python code against a set of test cases.
 * Returns a Promise that resolves to the TestResult object.
 */
function executePython(userCode, testCases) {
    return new Promise((resolve, reject) => {
        const scriptContent = buildPythonScript(userCode, testCases);

        const filename = `eval_${crypto.randomBytes(8).toString('hex')}.py`;
        const filepath = path.join(TMP_DIR, filename);

        // Write the generated python script
        fs.writeFile(filepath, scriptContent, 'utf8', (err) => {
            if (err) return reject(new Error('Failed to create execution file'));

            // Execute the script with a 3-second timeout
            execFile('python', [filepath], { timeout: 3000 }, (error, stdout, stderr) => {
                // Cleanup temp file
                fs.unlink(filepath, () => { });

                if (error && error.killed) {
                    return resolve({
                        status: "failed",
                        message: "Execution Timeout",
                        cases: [],
                        summary: "Your code took too long to execute (Infinite loop?)."
                    });
                }

                // If python script crashed heavily before JSON dump
                if (stderr) {
                    return resolve({
                        status: "failed",
                        message: "Runtime Error",
                        cases: [],
                        summary: stderr.trim()
                    });
                }

                try {
                    // Python script specifically prints formatted JSON
                    const resultJson = JSON.parse(stdout.trim());
                    resolve(resultJson);
                } catch (parseErr) {
                    resolve({
                        status: "failed",
                        message: "Parse Error",
                        cases: [],
                        summary: "Failed to parse Python execution output.\\n\\nOutput:\\n" + stdout
                    });
                }
            });
        });
    });
}

module.exports = {
    executePython
};
