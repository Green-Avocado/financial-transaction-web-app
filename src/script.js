function addTransactionButton()
{
    var date = document.getElementById("date").value;
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
        var id = generateId();
        var costBasis = calculateCostBasis(amount, dAmount);

        addTransaction(id, date, account, type, security, amount, dAmount, costBasis);
    }
}

function addTransaction(id, date, account, type, security, amount, dAmount, costBasis)
{
    var tableBody = document.getElementById('tableBody');
    var newRow = tableBody.insertRow(0);
    newRow.classList += "bodyRow";

    var actionsContent = "<button type='button'>Edit</button> <button type='button' onclick='deleteRow(this)'>Delete</button>";
    dAmount = '$' + dAmount.toFixed(2);
    var rowContents = [id, date, account, type, security, amount, dAmount, costBasis, actionsContent];

    for(var i = 0; i < rowContents.length; i++) {
        var newCell = newRow.insertCell(i);
        newCell.innerHTML = rowContents[i];
        if(i == 0) {
            newCell.classList += "idCell";
        }
    }
}

function validate(date, account, type, security, amount, dAmount)
{
    if(!validateDate(date)) return false;
    if(!validateAccount(account)) return false;
    if(!validateType(type)) return false;
    if(!validateSecurity(security)) return false;
    if(!validateAmount(amount)) return false;
    if(!validateDAmount(dAmount)) return false;

    return true;
}

function validateDate(date)
{
    realDate = new Date();
    inputDate = document.getElementById('date').valueAsNumber;

    if(isNaN(inputDate)) {
        alert('Error: No date specified');
        return false;
    }

    if(realDate.valueOf() < inputDate) {
        alert('Error: Date is in the future');
        return false;
    }

    return true;
}

function validateAccount(account)
{
    if(account == '') {
        alert('Error: Missing Account Number');
        return false;
    }

    return true;
}

function validateType(type)
{
    if(type == '') {
        alert('Error: Missing Transaction Type');
        return false;
    }

    return true;
}

function validateSecurity(security)
{
    if(security == '') {
        alert('Error: Missing Security');
        return false;
    }
    
    return true;
}

function validateAmount(amount)
{
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

function validateDAmount(dAmount)
{
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

function generateId()
{
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

function calculateCostBasis(amount, dAmount)
{
    costBasis = '$' + (dAmount / amount).toFixed(2);
    return costBasis;
}

function deleteRow(button)
{
    var row = button.parentElement.parentElement;
    document.getElementById("tableBody").removeChild(row);
}

function editRow(button)
{
}

function saveChanges()
{
}

function discardChanges()
{
}

function sortTable(column, ascending)
{
    var tableBody = document.getElementById('tableBody');
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
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            }
        }
    }
}

function updateTable()
{
}

