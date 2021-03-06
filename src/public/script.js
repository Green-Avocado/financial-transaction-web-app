/*
 * Removes a dollar sign if necessary, then replaces all commas with an empty string and converts to a number
 */
function formattedStringToNumber(numberAsString) {
    var number;

    if(numberAsString[0] == '$') {
        numberAsString = numberAsString.substr(1);
    }

    number = Number(numberAsString.replace(/,/g, ''));

    return number;
}

/*
 * The regex operation groups the number into groups of 3 digits and places commas at the beginning of each group, except the first group
 * This operation applies separately to digits after a decimal or other special character.
 */
function numberToFormattedString(number) {
    var numberAsString;

    numberAsString = String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return numberAsString;
}

function getData() {
    var date = document.getElementById("date");
    var account = document.getElementById("account").value;
    var type = document.getElementById("type").value;
    var security = document.getElementById("security").value;
    var amount = document.getElementById("amount").value;
    var dAmount = document.getElementById("dAmount").value;

    // set security string to all upper case
    security = security.toUpperCase();

    amount = formattedStringToNumber(amount);

    dAmount = formattedStringToNumber(dAmount);

    if(validate(date, account, type, security, amount, dAmount)) {
        var costBasis = '$' + numberToFormattedString(calculateCostBasis(amount, dAmount));
        date = date.value;

        amount = numberToFormattedString(amount);
        dAmount = '$' + numberToFormattedString(dAmount.toFixed(2));

        return [ date, account, type, security, amount, dAmount, costBasis ];
    }
    else return false;
}

function validate(date, account, type, security, amount, dAmount) {
    if(!validateDate(date)) return false;
    if(!validateAccount(account)) return false;
    if(!validateType(type)) return false;
    if(!validateSecurity(security)) return false;
    if(!validateAmount(amount)) return false;
    if(!validateDAmount(dAmount)) return false;

    return true;
}

function validateDate(date) {
    realDate = new Date();
    inputDate = date.valueAsNumber;

    if(date.value == '') {
        alert('Error: Missing date');
        return false;
    }

    if(!date.checkValidity()) {
        alert('Error: Invalid date');
        return false;
    }

    if(realDate.valueOf() < inputDate) {
        alert('Error: Date is in the future');
        return false;
    }

    return true;
}

function validateAccount(account) {
    if(account == '') {
        alert('Error: Missing Account Number');
        return false;
    }

    return true;
}

function validateType(type) {
    if(type == '') {
        alert('Error: Missing Transaction Type');
        return false;
    }

    return true;
}

function validateSecurity(security) {
    if(security == '') {
        alert('Error: Missing Security');
        return false;
    }
    
    return true;
}

function validateAmount(amount) {
    if(amount == '') {
        alert('Error: Missing Amount');
        return false;
    }

    if(isNaN(amount)) {
        alert('Error: Invalid Amount');
        return false;
    }

    return true;
}

function validateDAmount(dAmount) {
    if(dAmount == '') {
        alert('Error: Missing $ Amount');
        return false;
    }

    if(isNaN(dAmount)) {
        alert('Error: Invalid $ Amount');
        return false;
    }

    return true;
}

function generateId() {
    var id = '';
    var idLength = 6;

    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;

    var unique = false;

    while(!unique) {
        for(var i = 0; i < idLength; i++) {
            id += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        unique = true;
        for(var i = 0; i < document.getElementsByClassName('idCell').length; i++) {
            if(document.getElementsByClassName('idCell')[i].innerText == id) {
                unique = false;
                break;
            }
        }
    }
    return id;
}

function calculateCostBasis(amount, dAmount) {
    costBasis = (dAmount / amount).toFixed(2);
    return costBasis;
}

function addTransaction(data) {
    var staging = data;
    var tableBody = document.getElementById('tableBody');
    var newRow = tableBody.insertRow(0);
    newRow.classList += "bodyRow";

    var actionsContent = "<button type='button' onclick='editRow(this)'>Edit</button><button type='button' onclick='deleteRow(this)'>Delete</button>";
    var fileContent = '<table><tbody>';
    if(data.length > 8) {
        for(let i = 0; i < data[8].length; i++) {
            fileContent += "<tr><td><a onclick='downloadFile(`" + data[8][i][0] + "`);' href='javascript:void(0);'>" + data[8][i][1] + "</a></td>";
            fileContent += "<td><button type='button' onclick='removeFileFromTable(`" + data[8][i][0] + "`, this);'>-</button></td></tr>";
        }
    }
    fileContent += '</tbody></table><input type="file" onchange="addFile(this, 0);" multiple/>';
    staging[8] = fileContent;
    staging[9] = actionsContent;

    /*
     * The function assumes that a cost basis is needed, then checks whether or not type starts with an exclamation mark, if so, it corrects
     * the variable so that cost basis is marked as unneeded, and the type is parsed to remove the exclamation mark
     */
    var calculateCostBasis = true;
    if(data[3][0] == '!') {
        calculateCostBasis = false;
        data[3] = data[3].substr(1);
    }

    for(var i = 0; i < 10; i++) {
        var newCell = newRow.insertCell(i);
        var idShowing = (document.getElementById('toggleId').innerText == "Hide Transaction ID");
        
        newCell.innerHTML = data[i];

        /*
         * UPDATE:
         *
         * The code below has been changed to set the classes of the first two cells to frozen column classes if necessary.
         * This is done by checking whether or not "Hide Transaction ID" is currently active, by checking the text of the button.
         * This ensures that newly added rows have the correct alignment and that new IDs are hidden when necessary"
         *
         * This is done for the first two columns, and the solution for the third column is commented out.
         */
        if(i == 0) {
            if(idShowing)
                newCell.classList = "idCell frozenColumn1";
            else {
                newCell.classList = "idCell";
                newCell.setAttribute("hidden", true);
            }
        }
        else if(i == 1) {
            if(idShowing)
                newCell.classList = "frozenColumn2";
            else
                newCell.classList = "frozenColumn1";
        }
        /*
        else if(i == 2) {
            if(idShowing)
                newCell.classList = "frozenColumn3";
            else
                newCell.classList = "frozenColumn2";
        }
        */

        /*
         * If the cell being added is the cost basis cell, and cost basis has been marked as unnecessary, the cell is overwritten with "N/A"
         */
        if(i == 7 && !calculateCostBasis) {
            newCell.innerHTML = "N/A";
        }
    }
}

function fileIdGenerator() {
    return Math.floor(Math.random() * 1000000000000000000000000000000000000000000).toString(36);
}

function addTransactionButton() {
    var data = getData();
    if(data) {
        var id = generateId();
        data.unshift(id);

        fileList = new Array()
        uploadFile(data, addTransactionWithFileName, fileList, 0);
        clearInput(false);
    }
}

function addTransactionWithFileName(data) {
    addTransaction(data);
    console.log(data);
    loadDataLists();
}



/*
 * To add a popup box asking for confirmation, wrap the contents of this function
 * in an if-statement with the condition:
 *
 *      confirm("message")
 * 
 * This will return true if the user clicks "OK", in which case, the function will be executed.
 */

function deleteRow(button) {
    var row = button.parentElement.parentElement;

    var fileRows = row.getElementsByTagName('td')[8].getElementsByTagName('table')[0].getElementsByTagName('tr');
    for(let i = 0; i < fileRows.length; i++) {
        let fileId = fileRows[i].getElementsByTagName('a')[0].getAttribute('onclick').split('`')[1];
        deleteFileFromIndexedDB(fileId);
    }

    document.getElementById("tableBody").removeChild(row);

    if(document.getElementsByClassName('editing').length == 0) {
        document.getElementById('add').removeAttribute('hidden');
        document.getElementById('save').setAttribute('hidden', true);
        document.getElementById('discard').setAttribute('hidden', true);

        document.getElementById('add').setAttribute('type','submit');
        document.getElementById('save').setAttribute('type','button');
    }
    loadDataLists();
}

function editRow(button) {
    if(document.getElementsByClassName('editing').length > 0)
        document.getElementsByClassName('editing')[0].classList = "bodyRow";

    var row = button.parentElement.parentElement;
    var rowContent = row.getElementsByTagName('td');
    row.classList = "bodyRow editing";

    document.getElementById('date').value = rowContent[1].innerText;
    document.getElementById('account').value = rowContent[2].innerText;

    /*
     * When setting the transaction type to a type that does not exist, the value is replaced with an empty string.
     * By checking whether or not the value is an empty string, we can determine if an exclamation mark needs to be added
     */
    document.getElementById('type').value = rowContent[3].innerText;
    if(document.getElementById('type').value == '') document.getElementById('type').value = '!' + rowContent[3].innerText;

    document.getElementById('security').value = rowContent[4].innerText;
    document.getElementById('amount').value = rowContent[5].innerText;
    document.getElementById('dAmount').value = rowContent[6].innerText;

    document.getElementById('add').setAttribute('hidden', true);
    document.getElementById('save').removeAttribute('hidden');
    document.getElementById('discard').removeAttribute('hidden');

    document.getElementById('add').setAttribute('type','button');
    document.getElementById('save').setAttribute('type','submit');

    removeFileUpload();
    uploadLabel = document.getElementById('fileUploadLabel');
    if(rowContent[8].getElementsByTagName('tr').length > 0) {
        uploadLabel.innerHTML = String(rowContent[8].getElementsByTagName('tr').length) + " file(s)";
    }
    fileEditted = false;
}

function saveChanges() {
    data = getData();
    if(data) {
        rowToEdit = document.getElementsByClassName('editing')[0];
        cellsToEdit = rowToEdit.getElementsByTagName('td');

        /*
         * If the first character of the transaction type is an exclamation mark,
         * the type has the first character removed, and the cost basis is replaced with "N/A"
         */
        if(data[2][0] == '!') {
            data[2] = data[2].substr(1);
            data[6] = "N/A";
        }

        for(var i = 0; i < data.length; i++) {
            cellsToEdit[i + 1].innerHTML = data[i];
        }
        rowToEdit.classList = "bodyRow";

        document.getElementById('add').removeAttribute('hidden');
        document.getElementById('save').setAttribute('hidden', true);
        document.getElementById('discard').setAttribute('hidden', true);

        document.getElementById('add').setAttribute('type','submit');
        document.getElementById('save').setAttribute('type','button');

        if(fileEditted) {
            uploadFile([cellsToEdit[8]], updateExistingFileName, new Array(), 0);
        }
        else {
            removeFileUpload();
        }

        resetDate();
        clearInput(true);
        loadDataLists();
    }
}

function discardChanges() {
    document.getElementsByClassName('editing')[0].classList = "bodyRow";

    document.getElementById('add').removeAttribute('hidden');
    document.getElementById('save').setAttribute('hidden', true);
    document.getElementById('discard').setAttribute('hidden', true);

    document.getElementById('add').setAttribute('type','submit');
    document.getElementById('save').setAttribute('type','button');

    resetDate();
    clearInput(true);
    removeFileUpload();
}

function sortTable(column, ascending) {
    var rows = document.getElementsByClassName('bodyRow');

    var sorting = true;
    while(sorting) {
        sorting = false;
        for(var i = 0; i < (rows.length - 1); i++) {
            rowA = rows[i].getElementsByTagName('td')[column];
            rowB = rows[i + 1].getElementsByTagName('td')[column];

            var swap = false;

            if(ascending && rowA.innerHTML.toLowerCase() > rowB.innerHTML.toLowerCase()) swap = true;
            else if(!ascending && rowA.innerHTML.toLowerCase() < rowB.innerHTML.toLowerCase()) swap = true;
            
            if(swap) {
                sorting = true;
                document.getElementById('tableBody').insertBefore(rows[i + 1], rows[i]);
            }
        }
    }
}

/*
 * To set the date of an HTML5 date input, the string must be in yyy-mm-dd format
 * 
 * The date object does have a method to provide the current date in the correct format, however, this is in UTC when it is preferrable to get the user local time
 *
 * A new date object is created to get the current date
 * Three Intl.DateTimeFormat objects are created to format the year, month, and day in the correct formats
 * These are then combined into one string and used to set the value of the date field
 */
function resetDate() {
    const today = new Date();
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(today);
    const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(today);
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(today);

    document.getElementById('date').value = `${year}-${month}-${day}`;
}

/* 
 * This function takes an argument 'clearAccount' to specify whether or not the account number should be cleared
 * The function then sets all values to be cleared to an empty string
 */

function clearInput(clearAccount) {
    if(clearAccount)
        document.getElementById('account').value = '';

    document.getElementById('type').value = '';
    document.getElementById('security').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('dAmount').value = '';
}

/*
 * This function receives all filters as plain text, except for dates, which are recieved as their HTML elements
 * The function calls each of the functions responsible for validating filter data
 *
 * Some of these functions do not perform validation, for example, the transaction id validation always returns true
 * These functions exist in case these need to be validated in the future
 */
function validateFilters(filterId, startDate, endDate, filterAccount, filterType, filterSecurity, minAmount, maxAmount, minDAmount, maxDAmount, minCostBasis, maxCostBasis) {
    if(!validateFilterId(filterId)) return false;
    if(!validateDateRange(startDate, endDate)) return false;
    if(!validateFilterAccount(filterAccount)) return false;
    if(!validateFilterSecurity(filterSecurity)) return false;
    if(!validateAmountRange(minAmount, maxAmount)) return false;
    if(!validateDAmountRange(minDAmount, maxDAmount)) return false;
    if(!validateCostBasisRange(minCostBasis, maxCostBasis)) return false;

    return true;
}

function validateFilterId(id) {
    return true;
}

function validateDateRange(start, end) {
    if(!start.checkValidity()) {
        alert('Error: Invalid Start Date');
        return false;
    }

    if(!end.checkValidity()) {
        alert('Error: Invalid End Date');
        return false;
    }

    if(start.valueAsNumber > end.valueAsNumber) {
        alert('Error: Invalid Date Range');
        return false;
    }

    return true;
}

function validateFilterAccount(account) {
    return true;
}

function validateFilterSecurity(security) {
    return true;
}

function validateAmountRange(min, max) {
    if(isNaN(Number(min))) {
        alert('Error: Min Amount is NaN');
        return false;
    }

    if(isNaN(Number(max))) {
        alert('Error: Max Amount is NaN');
        return false;
    }

    if(Number(min) > Number(max) && min != '' && max != '') {
        alert('Error: Invalid Amount Range');
        return false;
    }
    
    return true;
}

function validateDAmountRange(min, max) {
    if(isNaN(Number(min))) {
        alert('Error: Min $ Amount is NaN');
        return false;
    }

    if(isNaN(Number(max))) {
        alert('Error: Max $ Amount is NaN');
        return false;
    }

    if(Number(min) > Number(max) && min != '' && max != '') {
        alert('Error: Invalid $ Amount Range');
        return false;
    }
    
    return true;
}

/*
 * UPDATE: original code lacked the
 * !(min == '' || max == '')
 * part of the last if condition
 *
 * This new check tells the function to skip the range verification if either of the strings are empty
 *
 * The new condition evaluates false if either of the inner conditions are true
 *      Translated, the condition is NOT (min is empty OR max is empty)
 *      
 *      If either is empty, this becomes NOT (true)
 *
 *      If neither is empty, this becomes NOT (false)
 */
function validateCostBasisRange(min, max) {
    if(isNaN(Number(min))) {
        alert('Error: Min Cost Basis is NaN');
        return false;
    }

    if(isNaN(Number(max))) {
        alert('Error: Max Cost Basis is NaN');
        return false;
    }

    if(Number(min) > Number(max) && min != '' && max != '') {
        alert('Error: Invalid Cost Basis Range');
        return false;
    }
    
    return true;
}

/*
 * For applyFilter():
 *
 * The function removes the effects of any previous filters by calling unfilterAll().
 *
 * The rows of the table are stored in an array, all the values of filters are stored as variables for future reference.
 *
 * Dollar signs are removed from applicable values if necessary.
 *
 * The for loop goes through every row, creates an array of its cells, and compares each value to each filter.
 *
 * If and only if the filter has data and does not match the contents of the row is the row hidden.
 *
 * Each filter performs its own check, if any of them do not match the data, the cell is hidden.
 *
 * For number values, such as account number, dollar amount, cost basis, everything is converted to a numeric type and compared as > or <.
 *
 * For dates, strings can be compared directly as long as they are in the same format.
 *
 *
 *
 * UPDATE:
 *
 * Though this has not been implemented, to support multiple filters for the same category, and to support exclusive filters:
 *      Each filter that deals with a string would be parsed to get an array of rules
 *      A function would loop through every rule, hiding rows that did not meet these requirements
 *
 *      First, a parsing function would split a filter field into an array
 *          For example: "!ABC AND !DEF" would be split as ["!ABC", "!DEF"] and each one would be handled separately.
 *              Other operators might exist, such as OR. In the case of OR, the two arguments would have to be grouped as one
 *
 *      For each item in the array, the filter would be parsed further to interpret it.
 *          The condition "!ABC"[0] == "!" could be used to determine if the first character was an exclamation mark,
 *          which would indicate that the following string is to be excluded.
 *              The function would then go through each row and only hide those matching "ABC"
 *
 *          This process would be repeated for each filter in the array
 */

function stringFilter(filtertext, tableitem) {
    filters = filtertext.split(" && ");

    for(var i = 0; i < filters.length; i++) {
        filterORs = filters[i].split(" || ");
        var meetsCriteria = false;

        for(var ii = 0; ii < filterORs.length; ii++) {
            // Note the .toUpperCase() methods to set all strings to all upper case for comparison
            if(filterORs[ii][0] == "!" && !tableitem.toUpperCase().includes(filterORs[ii].toUpperCase().substr(1))) meetsCriteria = true;
            if(filterORs[ii][0] != "!" && tableitem.toUpperCase().includes(filterORs[ii].toUpperCase())) meetsCriteria = true;
        }

        if(!meetsCriteria) return false;
    }

    return true;
}

function applyFilter() {
    unfilterAll();

    rows = document.getElementsByClassName('bodyRow');

    filterId = document.getElementById('filterId').value;
    startDate = document.getElementById('startDate');
    endDate = document.getElementById('endDate');
    filterAccount = document.getElementById('filterAccount').value;
    filterType = document.getElementById('filterType').value;
    filterSecurity = document.getElementById('filterSecurity').value;
    lowAmount = document.getElementById('lowAmount').value;
    highAmount = document.getElementById('highAmount').value;
    lowDAmount = document.getElementById('lowDAmount').value;
    highDAmount = document.getElementById('highDAmount').value;
    lowCostBasis = document.getElementById('lowCostBasis').value;
    highCostBasis = document.getElementById('highCostBasis').value;

    if(lowDAmount[0] == '$') lowDAmount = lowDAmount.substr(1);
    if(highDAmount[0] == '$') highAmount = highDAmount.substr(1);
    if(lowCostBasis[0] == '$') lowCostBasis = lowCostBasis.substr(1);
    if(highCostBasis[0] == '$') highCostBasis = highCostBasis.substr(1);

    if(validateFilters(filterId, startDate, endDate, filterAccount, filterType, filterSecurity, lowAmount, highAmount, lowDAmount, highDAmount, lowCostBasis, highCostBasis)) {
        for(var i = 0; i < rows.length; i++) {
            cells = rows[i].getElementsByTagName('td');
            var hide = false;

            if(filterId != '' && !stringFilter(filterId,cells[0].innerText))
                hide = true;

            if(startDate.value != '' && startDate.value > cells[1].innerText)
                hide = true;

            if(endDate.value != '' && endDate.value < cells[1].innerText)
                hide = true;

            if(filterAccount != '' && !stringFilter(filterAccount, cells[2].innerText))
                hide = true;

            if(filterType != '' && filterType != cells[3].innerText)
                hide = true;

            if(filterSecurity != '' && !stringFilter(filterSecurity, cells[4].innerText))
                hide = true;

            if(lowAmount != '' && Number(lowAmount) > formattedStringToNumber(cells[5].innerText))
                hide = true;

            if(highAmount != '' && Number(highAmount) < formattedStringToNumber(cells[5].innerText))
                hide = true;

            if(lowDAmount != '' && Number(lowDAmount) > formattedStringToNumber(cells[6].innerText.substr(1)))
                hide = true;

            if(highDAmount != '' && Number(highDAmount) < formattedStringToNumber(cells[6].innerText.substr(1)))
                hide = true;

            if(lowCostBasis != '' && Number(lowCostBasis) > formattedStringToNumber(cells[7].innerText.substr(1)))
                hide = true;

            if(highCostBasis != '' && Number(highCostBasis) < formattedStringToNumber(cells[7].innerText.substr(1)))
                hide = true;

            if(filterNA.checked && cells[7].innerText == "N/A")
                hide = true;

            if(hide)
                rows[i].setAttribute('hidden', true);
        }
    }
}

/*
 * This function removed the content of all filter fields and unhides all rows
 */

function clearFilter() {
    unfilterAll();

    var fields = document.getElementsByClassName('filterField');

    for(var i = 0; i < fields.length; i++) {
        fields[i].value = '';
    }

    document.getElementById('filterNA').checked = false;
}

/*
 * Every row with a class of 'bodyRow' has the 'hidden' attribute removed.
 * This unhides all rows that may have been hidden from previous filtering
 */

function unfilterAll() {
    rows = document.getElementsByClassName('bodyRow');
    
    for(var i = 0; i < rows.length; i++) {
        rows[i].removeAttribute('hidden');
    }
}

/*
 * For toggleID():
 *
 * Toggling the visibility of the ID column is best done by giving all cells in this column the 'hidden' attribute.
 * This method allows the browser to render the table as if these elements did not exist.
 * However, the elements are still present in case we need to reference them or reveal them.
 *
 * The function determines whether or not the column is already hidden based on the button text:
 *     By default, the button text will show "Hide Transaction ID", indicating that the column is currently visible.
 *     Otherwise, we cans safely assume that the column is already hidden.
 * 
 * To hide the column, the cell in each row is given the attribute 'hidden' which is set to 'true'.
 *     This is done separately for the header, as it uses the 'th' tag, but all other rows use the 'td' tag and can be hidden with a loop.
 * 
 * When the column is not hidden, it has the 'frozenColumn1' class to indicate that it is the first frozen column, while the date column
 * has the 'frozenColumn2' class.
 *     The ID column has this class removed, while the date column has class replaced by 'frozenColumn1' so that it sticks to the left of the table.
 *
 * To reveal the column, the above actions are reversed.
 *     The 'hidden' attribute is removed from the previously hidden cells.
 *     The class are changed so that the ID column is 'frozenColumn1' and the date column is 'frozenColumn2'.
 */

function toggleID() {
    var button = document.getElementById('toggleId');
    var rows = document.getElementsByTagName('tr');
    var cells = rows[0].getElementsByTagName('th');

    if(button.innerText == "Hide Transaction ID") {
        button.innerText = "Show Transaction ID";

        cells[0].setAttribute('hidden', true);
        cells[0].classList = "";
        cells[1].classList = "frozenColumn1";
        //cells[2].classList = "frozenColumn2";
        for(var i = 1; i < rows.length; i++) {
            cells = rows[i].getElementsByTagName('td');

            cells[0].setAttribute('hidden', true);
            cells[0].classList = "idCell";
            cells[1].classList = "frozenColumn1";
            //cells[2].classList = "frozenColumn2";
        }
    }
    else {
        button.innerText = "Hide Transaction ID";

        cells[0].removeAttribute('hidden');
        cells[0].classList = "frozenColumn1";
        cells[1].classList = "frozenColumn2";
        //cells[2].classList = "frozenColumn3";
        for(var i = 1; i < rows.length; i++) {
            cells = rows[i].getElementsByTagName('td');

            cells[0].removeAttribute('hidden');
            cells[0].classList = "idCell frozenColumn1";
            cells[1].classList = "frozenColumn2";
            //cells[2].classList = "frozenColumn3";
        }
    }
}

/*
 * This function is set to execute whenever the input type="file" element is updated (i.e. whenever a user selects a file)
 *
 * The function first checks that a file exists to be read, then creates a FileReader object.
 * This object is given an onload property which calls a function to get the output of the file read and set the 'typesArray' input field as this output string
 *
 * The reader then attempts to read a plaintext file specified by the user. If multiple files are chosen, it reads only the first time.
 * Once this process is complete, the function specified by the 'onload' property is executed.
 */
function readFile(fileIn){
    if(fileIn.files && fileIn.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var output = e.target.result;
            document.getElementById('typesArray').value = output;
        };
        reader.readAsText(fileIn.files[0]);
    }
}

/*
 * The 'a' element can be used to save a file when clicked.
 * This function creates a hidden 'a' element and adds it to the document, with attributes to download a plaintext file when clicked
 * The content of this file is the encoded value of the 'typesArray' value so that the user specified types can be saved
 * Javascript is used to simulate a click on this element to prompt the download, then the element is removed.
 */
function saveFile() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(document.getElementById('typesArray').value));
  element.setAttribute('download', 'transaction-types.csv');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/*
 * All child elements of the <select> elements are removed and replaced by a single blank option
 *
 * The function creates an array using values in the input field, separated by commas
 * For each item in this array, the function adds a new option to the <select> elements, effectively adding a transaction type
 * This is done for all the types specified by the user in the input field
 *
 * UPDATE: applyTypes() now only splits the input field into an array and passes it to the setTransactionTypesList() function
 *
 *      setTransactionTypesList() does exactly what applyTypes used to do, it has been separated to accomodate use by the database
 */
function applyTypes() {
    var typesArray = document.getElementById('typesArray').value.split(',');
    setTransactionTypesList(typesArray);
}

/*
 * The editTypes() function sets the value of the types input field to the return value of readCurrentTypes() as a comma-separated string.
 *
 * readCurrentTypes() is a function that gets the current types by reading the elements in the dropdown menu and saves these as an array.
 * It is located in the googleApiScript.js file, as it was originally created to store types in a database/spreadsheet.
 *
 * By taking this array and calling the 'join()' method, passing ',' as the argument, we can convert the array to a string where
 * items are separated by commas.
 */

function editTypes() {
    document.getElementById('typesArray').value = readCurrentTypes().join(',');
}

/*
 * NOTE REGARDING ADDING TRANSACTION TYPES
 *
 * An "add" button for transaction types would be identical to the 'setTransactionTypesList()' function below,
 * except it would exclude the lines:
 *
 *      type.innerHTML = '<option value=""></option>';
 *      filterType.innerHTML = '<option value=""></option>';
 *
 * as these lines are responsible for clearing the types before setting them.
 * With these removed, the function is simply adding as usual.
 */

function setTransactionTypesList(typesArray) {
    var type = document.getElementById('type');
    var filterType = document.getElementById('filterType');

    type.innerHTML = '<option value=""></option>';
    filterType.innerHTML = '<option value=""></option>';

    for(var i = 0; i < typesArray.length; i++) {
        var typeAsText = typesArray[i];
        if(typesArray[i][0] == '!') typeAsText = typesArray[i].substr(1);

        /*
         * typeAsText is the transaction type with the exclamation mark removed
         * This is used in all fields except the value attribute of the input field
         */
        type.innerHTML += '<option value="' + typesArray[i] + '">' + typeAsText + '</option>';
        filterType.innerHTML += '<option value="' + typeAsText + '">' + typeAsText + '</option>';
    }
}

/*
 * This function checks the text of the calling button.
 *     If the text is 'Hide', the section is currently visible and must be hidden by adding a 'hidden' attribute
 *     Otherwise, the section is currently hidden and must be revealed by removing the 'hidden' attribute
 */
function toggleSection(button) {
    var form = button.parentElement.parentElement.getElementsByTagName('form')[0];

    if(button.innerText == "Hide") {
        form.setAttribute("hidden",true);
        button.innerText = "Show";
    }
    else {
        form.removeAttribute("hidden");
        button.innerText = "Hide";
    }
}

function loadDataLists() {
    var accountsList = document.getElementById("accountsList");
    var securitiesList = document.getElementById("securitiesList");
    var rows = document.getElementsByClassName("bodyRow");

    var accounts = [];
    var securities = [];

    for(var i = 0; i < rows.length; i++) {
        var tableAccount = rows[i].getElementsByTagName("td")[2].innerText;
        var tableSecurity = rows[i].getElementsByTagName("td")[4].innerText;

        if(!accounts.includes(tableAccount)) accounts.push(tableAccount);
        if(!securities.includes(tableSecurity)) securities.push(tableSecurity);
    }

    accountsList.innerHTML = '';
    securitiesList.innerHTML = '';

    for(var i = 0; i < accounts.length; i++) {
        accountsList.innerHTML += '<option value="' + accounts[i] + '"/>';
    }

    for(var i = 0; i < securities.length; i++) {
        securitiesList.innerHTML += '<option value="' + securities[i] + '"/>';
    }
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
    var data = new Array();
    data.push(["Transaction Id", "Date", "Account Number", "Transaction Type", "Security", "Amount", "$ Amount", "Cost Basis", "Files"]);

    for(var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        var cellData = new Array();

        for(var j = 0; j < 8; j++) {
            cellData.push(cells[j].innerText);
        }
        cellData.push(getFileNamesIds(cells[8]));
        data.push(cellData);
    }

    console.log(data);
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
        let data = dataArr[dataArr.length - 1];
        let files = parseFileNamesIds(data[8]);
        data.pop();
        if(files.length > 0) {
            data.push(files);
        }
        addTransaction(data);
        dataArr.pop();
    }
    loadDataLists();
}



/*
 * The date is reset to the default when all elements have loaded
 */
window.onload = function() {
    resetDate();
    initDb();
}

