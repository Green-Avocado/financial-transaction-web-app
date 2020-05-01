var googleAuthenticated = false;

function tableToArrays() {
    var rows = document.getElementsByClassName('bodyRow');
    var data = [];

    for(var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        var cellData = [];

        for(var j = 0; j < cells.length - 1; j++) {
            cellData.push(cells[j].innerText);
        }
        data.push(cellData);
    }

    return data;
}

function arraysToTable(dataArr) {
    while(document.getElementsByClassName('bodyRow').length > 0) {
        document.getElementById("tableBody").removeChild(document.getElementsByClassName('bodyRow')[0]);
    }

    document.getElementById('add').removeAttribute('hidden');
    document.getElementById('save').setAttribute('hidden', true);
    document.getElementById('discard').setAttribute('hidden', true);

    document.getElementById('add').setAttribute('type', 'submit');
    document.getElementById('save').setAttribute('type', 'button');

    while(dataArr.length > 0) {
        addTransaction(dataArr[dataArr.length - 1]);
        dataArr.pop();
    }
}

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

function readGoogleSheetDB() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "range": "A1:H214748354"
    })
        .then(function(response) {
            console.log("Response", response);
            var dataArr = JSON.parse(response.body).values;
            arraysToTable(dataArr);
        },
        function(err) { console.error("Execute error", err); });
}

function writeGoogleSheetDB() {
    gapi.client.sheets.spreadsheets.batchUpdate({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "resource": {
        "requests": [
            {
            "updateSheetProperties": {
                "properties": {
                "gridProperties": {
                    "rowCount": 1,
                    "columnCount": 8
                }
                },
                "fields": "gridProperties"
            }
            }
        ]
        }
    })
        .then(function(response) {
            gapi.client.sheets.spreadsheets.values.clear({
            "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
            "range": "A1:H1",
            "resource": {}
        })
            .then(function(response) {
                console.log("Response", response);
                return gapi.client.sheets.spreadsheets.values.update({
                    "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
                    "range": "A1",
                    "includeValuesInResponse": true,
                    "responseValueRenderOption": "UNFORMATTED_VALUE",
                    "valueInputOption": "RAW",
                    "resource": {
                    "values": tableToArrays()
                    }
                })
                    .then(function(response) {
                        console.log("Response", response);
                    },
                    function(err) { console.error("Execute error", err); });
            },
            function(err) { console.error("Execute error", err); });
        },
        function(err) { console.error("Execute error", err); });
}

gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: "217251662395-9pu2qa1hubgrblav1nhvnfaascd6povv.apps.googleusercontent.com"});
    loadClient();
});

