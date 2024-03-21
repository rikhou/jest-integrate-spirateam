# Spira Integration with JestJS

This project was inspired by jest-spiratest. jest-integrate-spirateam also can create relation between jest test case and spiraTeam test case. But jest-integrate-spirateam does not require your jest test case to correspond to a spiraTeam test case.
By the way, jest-integrate-spirateam add some metric features. You need to config testFolderId property as below.

## Sample `package.json` with SpiraTest Integration

```javascript
{
    "jest": {
        "reporters": [
            "default",
            [
                "jest-integrate-spirateam",
                {
                    "url": "https://www.SpiraTeam.com",
                    "username": "abc",
                    "token": "{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}",
                    "projectId": 1,
                    "testFolderId": 2,
                    "testCases": {
                        "first test case": 10,
                        "second test case": 20
                    }
                }
            ]
        ]
    }
}
```
