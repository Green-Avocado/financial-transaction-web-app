function addTransaction(id, date, type, security, amount, dAmount)
{
    var table = document.getElementById('table');
    var newRow = document.createElement('td');
    var rowContents = [id, date, type, security, amount, dAmount];
    newRow.innerHTML = "<td>" + rowContents.join("</td><td>") + "</td>";

    table.appendChild(newRow);
}

function removeTransaction()
{
}

function editTransaction()
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

