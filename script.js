function addTransaction(id, date, type, security, amount, dAmount, costBasis)
{
    var tableBody = document.getElementById('tableBody');
    var newRow = document.createElement('tr');
    var rowContents = [id, date, type, security, amount, dAmount];
    newRow.innerHTML = "<td>" + rowContents.join("</td><td>") + "</td>";

    tableBody.appendChild(newRow);
}

function validate(date, type, security, amount, dAmount)
{
}

function removeTransaction(index)
{
}

function editTransaction(index)
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

