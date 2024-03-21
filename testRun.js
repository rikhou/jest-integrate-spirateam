const { compressName, getRequestOption, runnerName } = require("./common");

function postTestRunAPI(spiraConnectData) {
    const projectId = spiraConnectData.projectId;
    const username = spiraConnectData.username;
    const token = spiraConnectData.token;

    const api = `projects/${projectId}/test-runs/record?username=${username}&api-key=${token}`;
    return api;
}

async function postTestRuns(spiraConnectData, testRuns) {
    return new Promise((resolve) => {
        const api = postTestRunAPI(spiraConnectData);
        // console.log("api: ", api);
        const { options, protocol } = getRequestOption(spiraConnectData.url, api, "POST");
        let requestsCount = 0;
        // console.log(options, protocol);
        testRuns.forEach((testRun) => {
            const request = protocol(options, (res) => {
                console.log("request status Code: " + res.statusCode + ", testRun Data:" + JSON.stringify(testRun));
                res.on("data", (chunk) => {
                    requestsCount++;
                    if (requestsCount == testRuns.length) {
                        resolve();
                    }
                });
            });
            request.on("error", (e) => {
                console.log("Error:" + e);
            });
            // send the data
            request.write(JSON.stringify(testRun));
            request.end();
        });
    });
}

function generateTestRuns(testResult, testCases, testRuns) {
    const results = testResult.testResults;
    results.forEach((result) => {
        for (const testCase in testCases) {
            if (compressName(result.title) == testCase) {
                const newTestRun = {
                    TestCaseId: testCases[testCase],
                    RunnerName: runnerName,
                    RunnerTestName: result.title,
                    RunnerStackTrace: "",
                    ExecutionStatusId: -1,
                    StartDate: "/Date(" + new Date().getTime() + "-0000)/",
                    RunnerMessage: "",
                };

                // error messages
                result.failureMessages.forEach((fail) => {
                    newTestRun.RunnerStackTrace +=
                        fail.replace(
                            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                            ""
                        ) + "\n";
                });

                if (result.status == "passed") {
                    newTestRun.ExecutionStatusId = 2;
                    newTestRun.RunnerMessage = "Test Succeeded";
                } else if (result.status == "pending") {
                    newTestRun.ExecutionStatusId = 3;
                    newTestRun.RunnerMessage = "Test Not Run";
                } else {
                    newTestRun.ExecutionStatusId = 1;
                    newTestRun.RunnerMessage = "Test Failed";
                }

                testRuns.push(newTestRun);
            }
        }
    });
    // console.log(this.testRuns);
}

module.exports = { generateTestRuns, postTestRuns };
