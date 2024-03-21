const http = require("http");
const https = require("https");

const runnerName = "Jest";
const spiraServiceUrl = "/Services/v5_0/RestService.svc/";

function compressName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/gi, "");
}

function getRequestOption(spiraUrl, apiPath, method) {
    let url = spiraUrl + spiraServiceUrl + apiPath;
    let protocol = http.request;
    if (url.startsWith("https")) {
        protocol = https.request;
        url = url.substring(8);
    } else if (url.startsWith("http")) {
        url = url.substring(7);
    }

    const path = url.substring(url.indexOf("/"));
    url = url.substring(0, url.length - path.length);

    const options = {
        host: url,
        path: path,
        method: method,
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
    };

    return { options, protocol };
}

async function getResponseData(spiraUrl, apiPath, method) {
    return new Promise((resolve, reject) => {
        const { options, protocol } = getRequestOption(spiraUrl, apiPath, method);
        const testCaseReq = protocol(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            });
        });
        testCaseReq.on("error", (e) => {
            console.log("Error:" + e);
            reject(e);
        });
        testCaseReq.end();
    });
}

function initData(options, testCases, spiraConnectData) {
    if (
        options.hasOwnProperty("url") &&
        options.hasOwnProperty("username") &&
        options.hasOwnProperty("token") &&
        options.hasOwnProperty("projectId")
    ) {
        spiraConnectData.url = options.url;
        spiraConnectData.username = options.username;
        spiraConnectData.token = options.token;
        spiraConnectData.projectId = options.projectId;
    } else {
        console.error("'url', 'username', 'token', and 'projectId' fields are essential.");
    }

    if (options.hasOwnProperty("testFolderId")) {
        spiraConnectData.testFolderId = options.testFolderId;
    }

    if (options.hasOwnProperty("testCases")) {
        for (const testCase in options.testCases) {
            testCases[compressName(testCase)] = options.testCases[testCase];
        }
    } else {
        console.error("'testCases' field is essential.");
    }
    if (options.hasOwnProperty("outputFile")) {
        spiraConnectData.outputFile = options.outputFile;
    }
}

module.exports = { compressName, getRequestOption, runnerName, initData, getResponseData };
