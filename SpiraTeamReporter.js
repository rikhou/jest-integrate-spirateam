const { generateTestRuns, postTestRuns } = require("./testRun");
const { initData } = require("./common");
const { metric } = require("./metric");

class SpiraTeamReporter {
    spiraConnectData = {};
    testCases = {};
    testRuns = [];

    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        // transfer data from options to testCases and spiraConnectData
        initData(options, this.testCases, this.spiraConnectData);
    }

    onTestResult(test, testResult, aggregatedResult) {
        // generate test runs according to testResult and testCases
        generateTestRuns(testResult, this.testCases, this.testRuns);
    }

    async onRunComplete(contexts, results) {
        // post test runs to spiraTeam
        // await postTestRuns(this.spiraConnectData, this.testRuns);
        // calculate test case count and regression test case count in testFolderId
        if (this.spiraConnectData.testFolderId) {
            await metric(this.spiraConnectData, this.testCases);
        }
    }
}

module.exports = SpiraTeamReporter;
