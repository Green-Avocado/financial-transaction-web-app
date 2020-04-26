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
        if(i == 0) {
            newCell.classList += "idCell";
        }
    }
}

function validate(date, type, security, amount, dAmount)
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
    return true;
}

function validateAccount(account)
{
    return true;
}

function validateType(type)
{
    return true;
}

function validateSecurity(security)
{
    return true;
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
        for(var i = 0; i < document.getElementsByClassName('idCell'); i++) {
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

function sortTable(ascending)
{
}

function updateTable()
{
}

