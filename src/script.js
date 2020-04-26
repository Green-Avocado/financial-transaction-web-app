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

    if(validate()) {
        var id = generateId();
        var costBasis = calculateCostBasis(amount, dAmount);

        addTransaction(id, date, account, type, security, amount, dAmount, costBasis);
    }
}

function addTransaction(id, date, account, type, security, amount, dAmount, costBasis)
{
    var tableBody = document.getElementById('tableBody');
    var newRow = tableBody.insertRow(0);

    var actionsContent = "<button type='button'>Edit</button> <button type='button' onclick='deleteRow(this)'>Delete</button>";
    dAmount = '$' + dAmount.toFixed(2);
    var rowContents = [id, date, account, type, security, amount, dAmount, costBasis, actionsContent];

    for(var i = 0; i < rowContents.length; i++) {
        var newCell = newRow.insertCell(i);
        newCell.innerHTML = rowContents[i];
    }
}

function validate(date, type, security, amount, dAmount)
{
    if(!validateDate(date)) return false;
    if(!validateAmount(amount)) return false;
    if(!validateDAmount(dAmount)) return false;

    return true;
}

function validateDate(date)
{
    return true;
}

function validateAccount(account)
{
}

function validateType(type)
{
}

function validateSecurity(security)
{
}

function validateAmount(amount)
{
    return true;
}

function validateDAmount(dAmount)
{
    return true;
}

function generateId()
{
    var id;
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

function sortTable(ascending)
{
}

function updateTable()
{
}

