var auth2;

var spreadsheetId = "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co";
var sheetId = "Sheet1";
var sheetIdNum = 0;

function loadSheetData() {
    if(auth2.isSignedIn.get())
    {
        getAllUserSheets();
    }
    else {
        authenticate()
            .then(function() {
                if(auth2.isSignedIn.get()) getAllUserSheets();
            });
    }
}

function getNewSheetData() {
    spreadsheetId = document.getElementById('sheet').value;
    if(auth2.isSignedIn.get())
    {
        getTabsOfSheet();
    }
    else {
        authenticate()
            .then(function() {
                if(auth2.isSignedIn.get()) getTabsOfSheet();
            });
    }
}

function populateSheetSelector(arrayOfSheets) {
    document.getElementById('sheet').innerHTML = '<option value="1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co">default</option>';

    for(var i = 0; i < arrayOfSheets.length; i++) {
        document.getElementById('sheet').innerHTML += '<option value="' + arrayOfSheets[i].id + '">' + arrayOfSheets[i].name + '</option>';
    }
}

function getNewTabData() {
    data = document.getElementById('tab').value.split(/,(.+)/);
    sheetIdNum = data[0];
    sheetId = data[1];
}

function populateTabSelector(arrayOfTabs) {
    document.getElementById('tab').innerHTML = '';

    for(var i = 0; i < arrayOfTabs.length; i++) {
        document.getElementById('tab').innerHTML += '<option value="' + arrayOfTabs[i].properties.sheetId + ',' + arrayOfTabs[i].properties.title + '">' + arrayOfTabs[i].properties.title + '</option>';
    }
}

function getAllUserSheets() {
    return gapi.client.drive.files.list({
        "pageSize": 1000,
        "orderBy": "name",
        "q": "mimeType = 'application/vnd.google-apps.spreadsheet'",
    })
        .then(function(response) {
            populateSheetSelector(JSON.parse(response.body).files);
            getNewSheetData();
            console.log("Response", response);
        },
        function(err) { console.error("Execute error", err); });
}

function getTabsOfSheet() {
    return gapi.client.sheets.spreadsheets.get({
      "spreadsheetId": spreadsheetId,
      "includeGridData": false
    })
        .then(function(response) {
            populateTabSelector(JSON.parse(response.body).sheets);
            getNewTabData();
            console.log("Response", response);
        },
        function(err) { console.error("Execute error", err); });
}

function authenticate() {
return gapi.auth2.getAuthInstance()
    .signIn({scope: "https://www.googleapis.com/auth/drive"})
    .then(function() { console.log("Sign-in successful"); },
        function(err) { console.error("Error signing in", err); });
}

function loadClientSheets() {
gapi.client.setApiKey("AIzaSyDC6JNuMW78Q-gWsp0PFEaTsICYjHWymAo");
return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest")
    .then(function() { console.log("GAPI client loaded for API"); loadSheetData(); },
        function(err) { console.error("Error loading GAPI client for API", err); });
}

function loadClient() {
gapi.client.setApiKey("AIzaSyDC6JNuMW78Q-gWsp0PFEaTsICYjHWymAo");
return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
    .then(function() { console.log("GAPI client loaded for API"); loadClientSheets(); },
        function(err) { console.error("Error loading GAPI client for API", err); });
}

function readGoogleSheetDB() {
    clearIndexedDb("sheets");
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": spreadsheetId,
        "range": sheetId + "!A2:I214748354"
    })
        .then(function(response) {
            console.log("Response", response);

            dataArr = [];
            if(JSON.parse(response.body).values != undefined) {
                dataArr = JSON.parse(response.body).values;
            }
            arraysToTable(dataArr);

            readGoogleTypes();
        },
        function(err) { console.error("Execute error", err); });
}

function readGoogleTypes() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": spreadsheetId,
        "range": sheetId + "!J1:J214748354",
        "majorDimension": "COLUMNS"

    })
        .then(function(response) {
            console.log("Response", response);
            var typesArr = JSON.parse(response.body).values[0];
            setTransactionTypesList(typesArr);
        },
        function(err) { console.error("Execute error", err); });
}

function writeGoogleSheetDB() {
    if(auth2.isSignedIn.get())
    {
        setGoogleRows()
    }
    else {
        authenticate()
            .then(function() {
                if(auth2.isSignedIn.get()) setGoogleRows();
            });
    }
}

function setGoogleRows() {
    return gapi.client.sheets.spreadsheets.batchUpdate({
        "spreadsheetId": spreadsheetId,
        "resource": {
        "requests": [
            {
            "updateSheetProperties": {
                "properties": {
                    "gridProperties": {
                        "columnCount": 10,
                        "rowCount": 1
                },
                    "sheetId": sheetIdNum
                },
                "fields": "gridProperties"
            }
            }
        ]
        }
    })
        .then(function(response) {
            console.log("Response", response);

            clearGoogleRow();
        },
        function(err) { console.error("Execute error", err); });
}

function clearGoogleRow() {
    return gapi.client.sheets.spreadsheets.values.clear({
    "spreadsheetId": spreadsheetId,
    "range": sheetId + "!A1:J1",
    "resource": {}
    })
        .then(function(response) {
            console.log("Response", response);

            writeGoogleDB();
        },
        function(err) { console.error("Execute error", err); });
}

function writeGoogleDB() {
    writeImagesToFirestore("sheets");
    return gapi.client.sheets.spreadsheets.values.batchUpdate({
        "spreadsheetId": spreadsheetId,
        "resource": {
            "data": [
            {
                "range": sheetId + "!A1",
                "values": tableToArrays(),
                "majorDimension": "ROWS"
            },
            {
                "range": sheetId + "!J1",
                "values": [readCurrentTypes()],
                "majorDimension": "COLUMNS"
            }
            ],
            "valueInputOption": "RAW"
        }
        })
        .then(function(response) {
            console.log("Response", response);
        },
        function(err) { console.error("Execute error", err); });
}

gapi.load("client:auth2", function() {
    auth2 = gapi.auth2.init({client_id: "217251662395-9pu2qa1hubgrblav1nhvnfaascd6povv.apps.googleusercontent.com"});
    loadClient();
});

