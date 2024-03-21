const fs = require("fs");

const { getResponseData } = require("./common");

const regressionName = "Use in Regression Testing";
let allTestCases = [];

function testCaseInTestFolderAPI(folderId, spiraConnectData) {
    const projectId = spiraConnectData.projectId;
    const username = spiraConnectData.username;
    const token = spiraConnectData.token;
    const testCaseInTestFolderApi = `projects/${projectId}/test-folders/${folderId}/test-cases?starting_row=0&number_of_rows=500&username=${username}&api-key=${token}`;
    return testCaseInTestFolderApi;
}

function subfolderInTestFolderAPI(folderId, spiraConnectData) {
    const projectId = spiraConnectData.projectId;
    const username = spiraConnectData.username;
    const token = spiraConnectData.token;
    const testCaseInTestFolderApi = `projects/${projectId}/test-folders/${folderId}/children?&username=${username}&api-key=${token}`;
    return testCaseInTestFolderApi;
}

function getRegressionTestCase(data) {
    const regressionTestCase = data.filter((item) => {
        const filter = item.CustomProperties.filter((property) => {
            return property.Definition.Name == regressionName && property.IntegerValue == 142;
        });
        return filter && filter.length > 0;
    });

    return regressionTestCase;
}

function saveMetricToJsonFile(testCases, allCases, regressionCases, outputFile) {
    const coveredTestCaseCount = Object.keys(testCases).length;
    const info = {
        allTestCasesCount: allCases.length,
        regressionTestCaseCount: regressionCases.length,
        coveredTestCaseCount: coveredTestCaseCount,
        coveredRatio: Number((coveredTestCaseCount / regressionCases.length).toFixed(2)) * 100 + "%",
    };
    try {
        fs.writeFileSync(outputFile, JSON.stringify(info, null, 2), "utf8");
        console.log(`Metric results written to: ${outputFile}`);
    } catch (error) {
        console.error("Error appending information to file:", error);
    }
}

async function getAllTestCaseInFolder(folderId, spiraConnectData) {
    // test case
    const testCaseApiPath = testCaseInTestFolderAPI(folderId, spiraConnectData);
    const testCaseReq = await getResponseData(spiraConnectData.url, testCaseApiPath, "GET");
    allTestCases = allTestCases.concat(testCaseReq);
    console.log("Calculating test case ...", new Date().toLocaleString());

    // folder
    const subFolderApiPath = subfolderInTestFolderAPI(folderId, spiraConnectData);
    const subFoldData = await getResponseData(spiraConnectData.url, subFolderApiPath, "GET");

    for (const item of subFoldData) {
        // recursion
        await getAllTestCaseInFolder(item.TestCaseFolderId, spiraConnectData);
    }
}

async function metric(spiraConnectData, testCases) {
    await getAllTestCaseInFolder(spiraConnectData.testFolderId, spiraConnectData);

    if (allTestCases.length > 0) {
        const regressionTestCases = getRegressionTestCase(allTestCases);
        // regressionTestCase.forEach((item) => {
        //     console.log(item.Name, ",", item.TestCaseId);
        // });

        console.log(
            "Count of all cases:",
            allTestCases.length,
            ",Count of regression cases:",
            regressionTestCases.length
        );

        const outputFile = spiraConnectData.outputFile;
        if (outputFile) {
            saveMetricToJsonFile(testCases, allTestCases, regressionTestCases, outputFile);
        }
    }
}

module.exports = { metric };
