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

gapi.load("client:auth2", function() {
gapi.auth2.init();
});

