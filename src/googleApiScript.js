//This is the OAuth instance, by storing it, we can check if a user is already logged in
var auth2;

/*
 * This function goes through each of the body rows of the table and stores the text in the cells as an array of arrays
 *
 * This is done using a for loop nested in another for loop
 *      The inner loop gets each cell in a row
 *      The values of these cells are stored by pushing them into an array, which adds them to the end of the array
 *
 *      The outer loop is used to repeat the above process for each row in the table
 *      At the end of each iteration, the cells array is pushed into a data array, adding it to the end
 *
 *      The result is an array of arrays which contains all data in the table
 */
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

/*
 * This function takes an array of arrays and writes the data into the html page
 *
 * First, all rows are removed from the existing table in a while loop.
 *      The while loop removes the first element with a 'bodyRow' class until there are no more bodyRow elements
 *
 * Secondly, the buttons are set to the 'add transaction' state, in case a row was being editted
 *
 * Lastly, the function repopulates the table in a while loop
 *      The loop sends an array of data to the addTransaction() function.
 *          Fortunately, this function already takes an array of strings, so no modification to the data was required
 *
 *      The last array in the list is always taken, as the addTransaction function always adds to the top,
 *      the elements are added in reverse order to preserve the table order
 *
 *      After being added, the last array in the list is removed
 */
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

/*
 * This is taken directly from the documentation of the Google Sheets API
 *
 * The purpose of this function is to authenticate the user so that the program has permission to write to the sheet
 *
 * This is only called when necessary to avoid negatively affecting user experience
 *      Only called on writing to the database
 *      Only called if not already authenticated
 */
function authenticate() {
return gapi.auth2.getAuthInstance()
    .signIn({scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets"})
    .then(function() { console.log("Sign-in successful"); },
        function(err) { console.error("Error signing in", err); });
}

/*
 * This is taken directly from the documentation of the Google Sheets API
 *
 * This must be called before anything can be read from or written to the database, as it is reponsible for setting up the api client
 *
 * This function is called as soon as the Google API plugin is loaded
 */
function loadClient() {
gapi.client.setApiKey("AIzaSyDC6JNuMW78Q-gWsp0PFEaTsICYjHWymAo");
return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest")
    .then(function() { console.log("GAPI client loaded for API"); },
        function(err) { console.error("Error loading GAPI client for API", err); });
}

/*
 * This function reads data from the Google Sheets Database
 *
 * The spreadsheetId is set to our spreadsheet database
 *      The ID can be found as part of the URL
 *
 * The range is set to columns A-H and rows 1-214748354, the max number of rows it would allow
 *      This is done to ensure all data is read, the resulting array will only be as long as the data in this range
 * 
 * The function converts the response JSON object into an array of arrays
 *      It is necessary to only add this to the dataArr variable if it is not undefined, otherwise the program encounters an error
 *
 * The JSON object in array form is passed to the arraysToTable() function to populate the table
 *
 * The readGoogleTypes() function is called to update transaction types
 */
function readGoogleSheetDB() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "range": "A1:H214748354"
    })
        .then(function(response) {
            console.log("Response", response);

            var dataArr = []
            if(JSON.parse(response.body).values != undefined)
                dataArr.push(JSON.parse(response.body).values);

            arraysToTable(dataArr);

            readGoogleTypes();
        },
        function(err) { console.error("Execute error", err); });
}

/*
 * This function sends another API request to read the J column and update transaction types
 * The majorDimension is set to COLUMNS so the response comes as [[ J1, J2, J3 ]] rather than [ [J1], [J2], [J3] ]
 *
 * The array is passed to the setTransactionTypesList() function, which is responsible for setting types manually and through the database
 *      The original Javascript code has been modified to accomodate this
 *
 *      No changes have been made to how the old function works, it was only split into two parts so that this new function could use it
 */
function readGoogleTypes() {
    return gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "range": "J1:J214748354",
        "majorDimension": "COLUMNS"

    })
        .then(function(response) {
            console.log("Response", response);
            var typesArr = JSON.parse(response.body).values[0];
            setTransactionTypesList(typesArr);
        },
        function(err) { console.error("Execute error", err); });
}

/*
 * This function cycles through all option elements in the transaction types list
 *
 * The values of these options are stored as an array of strings
 *
 * This array is returned to the caller function so that the database can be updated
 */
function readCurrentTypes() {
    var types = document.getElementById('type').getElementsByTagName('option');
    var currentTypes = [];

    for(var i = 1; i < types.length; i++) {
        currentTypes.push(types[i].value);
    }

    return currentTypes;
}

/*
 * This function initiates the chain of functions that saves data to the database
 *
 * The function checks that the user is authenticated, if not, it prompts the user to do so
 *
 * Once the user logs in successfully, the function begins the chain
 *
 * If the user fails to log in successfully, the process is not started
 */
function writeGoogleSheetDB() {
    if(auth2.isSignedIn.je)
    {
        setGoogleRows()
    }
    else {
        authenticate()
            .then(function() {
                if(auth2.isSignedIn.je) setGoogleRows();
            });
    }
}

/*
 * As the first step in the chain to write to the database, the database is set to 1 row and 10 columns to remove any
 * data left from previous use
 *
 * It is not necessary to set this to accomodate all written data, as the table will automatically expand when writing data
 *
 * Once this function completes, the function logs the response in the console and calls the next stage, clearGoogleRow()
 */
function setGoogleRows() {
    return gapi.client.sheets.spreadsheets.batchUpdate({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "resource": {
        "requests": [
            {
            "updateSheetProperties": {
                "properties": {
                "gridProperties": {
                    "rowCount": 1,
                    "columnCount": 10
                }
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

/*
 * This function is used to remove any data in the first row left from previous use
 *
 * This is done by clearing the one and only row in the database
 *
 * Afterwards, the function calls the last stage, writeGoogleDB()
 */
function clearGoogleRow() {
    return gapi.client.sheets.spreadsheets.values.clear({
    "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
    "range": "A1:J1",
    "resource": {}
    })
        .then(function(response) {
            console.log("Response", response);

            writeGoogleDB();
        },
        function(err) { console.error("Execute error", err); });
}

/*
 * This function uses the batchUpdate() method to update multiple ranges in the database
 *
 * The resource specifies the values that should be changed
 *
 * Data from the return value of tableToArrays() is written to A1 with a major dimension of rows
 *      Every list within the list is a row
 *      Every element within the lesser list is a cell
 *
 * Data from the returnv value of readCurrentTypes() is placed in a list to match the expected format, then it is written to J1
 * with a major dimension of columns
 *      Every item in the list within the list is a new row
 */
function writeGoogleDB() {
    return gapi.client.sheets.spreadsheets.values.batchUpdate({
        "spreadsheetId": "1R0HpaAIUw-JHX8SrzvkEPCG1qgI-siJ9oucY6g5e4Co",
        "resource": {
            "data": [
            {
                "range": "A1",
                "values": tableToArrays(),
                "majorDimension": "ROWS"
            },
            {
                "range": "J1",
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

/*
 * This function is called once the gapi plugin has loaded
 *
 * Its purpose is to initialise the auth2 client and load the API client
 *
 * The auth2 client is stored as a global variable so that other functions can check if a user is authenticated
 */
gapi.load("client:auth2", function() {
    auth2 = gapi.auth2.init({client_id: "217251662395-9pu2qa1hubgrblav1nhvnfaascd6povv.apps.googleusercontent.com"});
    loadClient();
});

