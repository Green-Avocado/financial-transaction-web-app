function formattedStringToNumber(numberAsString) {
    var number;

    if(numberAsString[0] == '$') {
        numberAsString = numberAsString.substr(1);
    }

    number = Number(numberAsString.replace(/,/g, ''));

    return number;
}

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

    var calculateCostBasis = true;
    if(data[3][0] == '!') {
        calculateCostBasis = false;
        data[3] = data[3].substr(1);
    }

    for(var i = 0; i < 10; i++) {
        var newCell = newRow.insertCell(i);
        var idShowing = (document.getElementById('toggleId').innerText == "Hide Transaction ID");
        
        newCell.innerHTML = data[i];

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

function addTransactionWithFileName(data, fileName) {
    addTransaction(data);
    console.log(data);
    loadDataLists();
}

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

function resetDate() {
    const today = new Date();
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(today);
    const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(today);
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(today);

    document.getElementById('date').value = `${year}-${month}-${day}`;
}

function clearInput(clearAccount) {
    if(clearAccount)
        document.getElementById('account').value = '';

    document.getElementById('type').value = '';
    document.getElementById('security').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('dAmount').value = '';
}

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
        if(min != '') alert(min + '2');
        if(max != '') alert(max + '1');
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

function stringFilter(filtertext, tableitem) {
    filters = filtertext.split(" && ");

    for(var i = 0; i < filters.length; i++) {
        filterORs = filters[i].split(" || ");
        var meetsCriteria = false;

        for(var ii = 0; ii < filterORs.length; ii++) {
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

function clearFilter() {
    unfilterAll();

    var fields = document.getElementsByClassName('filterField');

    for(var i = 0; i < fields.length; i++) {
        fields[i].value = '';
    }

    document.getElementById('filterNA').checked = false;
}

function unfilterAll() {
    rows = document.getElementsByClassName('bodyRow');
    
    for(var i = 0; i < rows.length; i++) {
        rows[i].removeAttribute('hidden');
    }
}

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

function saveFile() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(document.getElementById('typesArray').value));
  element.setAttribute('download', 'transaction-types.csv');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function applyTypes() {
    var typesArray = document.getElementById('typesArray').value.split(',');
    setTransactionTypesList(typesArray);
}

function editTypes() {
    document.getElementById('typesArray').value = readCurrentTypes().join(',');
}

function setTransactionTypesList(typesArray) {
    var type = document.getElementById('type');
    var filterType = document.getElementById('filterType');

    type.innerHTML = '<option value=""></option>';
    filterType.innerHTML = '<option value=""></option>';

    for(var i = 0; i < typesArray.length; i++) {
        var typeAsText = typesArray[i];
        if(typesArray[i][0] == '!') typeAsText = typesArray[i].substr(1);

        type.innerHTML += '<option value="' + typesArray[i] + '">' + typeAsText + '</option>';
        filterType.innerHTML += '<option value="' + typeAsText + '">' + typeAsText + '</option>';
    }
}

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

window.onload = function() {
    resetDate();
    initDb();
}

