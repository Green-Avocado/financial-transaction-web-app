function getData() {
    var date = document.getElementById("date");
    var account = document.getElementById("account").value;
    var type = document.getElementById("type").value;
    var security = document.getElementById("security").value;
    var amount = document.getElementById("amount").value;
    var dAmount = document.getElementById("dAmount").value;

    amount = Number(amount);

    if(dAmount[0] == '$') {
        dAmount = dAmount.substr(1);
    }
    dAmount = Number(dAmount);

    if(validate(date, account, type, security, amount, dAmount)) {
        var costBasis = calculateCostBasis(amount, dAmount);
        date = date.value;
        dAmount = '$' + dAmount.toFixed(2);

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
    costBasis = '$' + (dAmount / amount).toFixed(2);
    return costBasis;
}

function addTransaction(data) {
    var tableBody = document.getElementById('tableBody');
    var newRow = tableBody.insertRow(0);
    newRow.classList += "bodyRow";

    var actionsContent = "<button type='button' onclick='editRow(this)'>Edit</button> <button type='button' onclick='deleteRow(this)'>Delete</button>";
    data.push(actionsContent);

    for(var i = 0; i < data.length; i++) {
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
    }
}

function addTransactionButton() {
    var data = getData();
    if(data) {
        var id = generateId();
        data.unshift(id);

        addTransaction(data);
        clearInput(false);
    }
}

function deleteRow(button) {
    var row = button.parentElement.parentElement;
    document.getElementById("tableBody").removeChild(row);

    if(document.getElementsByClassName('editing').length == 0) {
        document.getElementById('add').removeAttribute('hidden');
        document.getElementById('save').setAttribute('hidden', true);
        document.getElementById('discard').setAttribute('hidden', true);
    }
}

function editRow(button) {
    if(document.getElementsByClassName('editing').length > 0)
        document.getElementsByClassName('editing')[0].classList = "bodyRow";

    var row = button.parentElement.parentElement;
    var rowContent = row.getElementsByTagName('td');
    row.classList = "bodyRow editing";

    document.getElementById('date').value = rowContent[1].innerText;
    document.getElementById('account').value = rowContent[2].innerText;
    document.getElementById('type').value = rowContent[3].innerText;
    document.getElementById('security').value = rowContent[4].innerText;
    document.getElementById('amount').value = rowContent[5].innerText;
    document.getElementById('dAmount').value = rowContent[6].innerText;

    document.getElementById('add').setAttribute('hidden', true);
    document.getElementById('save').removeAttribute('hidden');
    document.getElementById('discard').removeAttribute('hidden');
}

function saveChanges() {
    data = getData();
    if(data) {
        rowToEdit = document.getElementsByClassName('editing')[0];
        cellsToEdit = rowToEdit.getElementsByTagName('td');

        for(var i = 0; i < data.length; i++) {
            cellsToEdit[i + 1].innerHTML = data[i];
        }
        rowToEdit.classList = "bodyRow";
    }

    document.getElementById('add').removeAttribute('hidden');
    document.getElementById('save').setAttribute('hidden', true);
    document.getElementById('discard').setAttribute('hidden', true);

    resetDate();
    clearInput(true);
}

function discardChanges() {
    document.getElementsByClassName('editing')[0].classList = "bodyRow";

    document.getElementById('add').removeAttribute('hidden');
    document.getElementById('save').setAttribute('hidden', true);
    document.getElementById('discard').setAttribute('hidden', true);

    resetDate();
    clearInput(true);
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
 */

function applyFilter() {
    unfilterAll();

    rows = document.getElementsByClassName('bodyRow');

    filterId = document.getElementById('filterId').value;
    startDate = document.getElementById('startDate').value;
    endDate = document.getElementById('endDate').value;
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

    for(var i = 0; i < rows.length; i++) {
        cells = rows[i].getElementsByTagName('td');
        var hide = false;

        if(filterId != '' && filterId != cells[0].innerText)
            hide = true;

        if(startDate != '' && startDate > cells[1].innerText)
            hide = true;

        if(endDate != '' && endDate < cells[1].innerText)
            hide = true;

        if(filterAccount != '' && filterAccount != cells[2].innerText)
            hide = true;

        if(filterType != '' && filterType != cells[3].innerText)
            hide = true;

        if(filterSecurity != '' && filterSecurity != cells[4].innerText)
            hide = true;

        if(lowAmount != '' && Number(lowAmount) > Number(cells[5].innerText.substr(1)))
            hide = true;

        if(highAmount != '' && Number(highAmount) < Number(cells[5].innerText.substr(1)))
            hide = true;

        if(lowDAmount != '' && Number(lowDAmount) > Number(cells[6].innerText.substr(1)))
            hide = true;

        if(highDAmount != '' && Number(highDAmount) < Number(cells[6].innerText.substr(1)))
            hide = true;

        if(lowCostBasis != '' && Number(lowCostBasis) > Number(cells[7].innerText.substr(1)))
            hide = true;

        if(highCostBasis != '' && Number(highCostBasis) < Number(cells[7].innerText))
            hide = true;

        if(hide)
            rows[i].setAttribute('hidden', true);
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
    if(fileIn.files && fileIn.files[0]){
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
 */
function applyTypes() {
    var typesArray = document.getElementById('typesArray').value.split(',');
    var type = document.getElementById('type');
    var filterType = document.getElementById('filterType');

    type.innerHTML = '<option value=""></option>';
    filterType.innerHTML = '<option value=""></option>';

    for(var i = 0; i < typesArray.length; i++) {
        type.innerHTML += '<option value="' + typesArray[i] + '">' + typesArray[i] + '</option>';
        filterType.innerHTML += '<option value="' + typesArray[i] + '">' + typesArray[i] + '</option>';
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

/*
 * The date is reset to the default when all elements have loaded
 */
window.onload = function() {
    resetDate();
}

