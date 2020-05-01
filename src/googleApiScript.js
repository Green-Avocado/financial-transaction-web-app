function authenticate() {
return gapi.auth2.getAuthInstance()
    .signIn({scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets"})
    .then(function() { console.log("Sign-in successful"); },
        function(err) { console.error("Error signing in", err); });
}

function loadClient() {
gapi.client.setApiKey("AIzaSyDC6JNuMW78Q-gWsp0PFEaTsICYjHWymAo");
return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest")
    .then(function() { console.log("GAPI client loaded for API"); },
        function(err) { console.error("Error loading GAPI client for API", err); });
}

function execute() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "range": "A1:C2"
    })
        .then(function(response) {
            console.log("Response", response);
            },
            function(err) { console.error("Execute error", err); });
}

function execute2() {
    return gapi.client.sheets.spreadsheets.values.update({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "range": "A1",
        "includeValuesInResponse": true,
        "responseValueRenderOption": "UNFORMATTED_VALUE",
        "valueInputOption": "RAW",
        "resource": {
        "values": [
            [
            "Banana",
            "Apricot"
            ],
            [
            "acorn",
            "pineapple"
            ]
        ]
        }
    })
        .then(function(response) {
            console.log("Response", response);
            },
            function(err) { console.error("Execute error", err); });
}

gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: "217251662395-9pu2qa1hubgrblav1nhvnfaascd6povv.apps.googleusercontent.com"});
});

