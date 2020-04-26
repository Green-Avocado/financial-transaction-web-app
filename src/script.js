function addTransactionButton()
{
    var date;
    var account;
    var type;
    var security;
    var amount;
    var dAmount;

    if(validate()) {
        var id = generateId();
        var costBasis = calculateCostBasis(amount, dAmount);

        addTransaction(id, date, account, type, security, amount, dAmount, costBasis);
    }
}

function addTransaction(id, date, account, type, security, amount, dAmount, costBasis)
{
    var tableBody = document.getElementById('tableBody');
    var newRow = document.createElement('tr');

    var actionsContent = "<button type='button'>Edit</button> <button type='button' onclick='deleteRow(this)'>Delete</button>";
    var rowContents = [id, date, account, type, security, amount, dAmount, actionsContent];

    newRow.innerHTML = "<td>" + rowContents.join("</td><td>") + "</td>";

    tableBody.appendChild(newRow);
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
    return dAmount / amount;
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

function sortTable()
{
}

function updateTable()
{
}

