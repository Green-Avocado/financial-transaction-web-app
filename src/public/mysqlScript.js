function writeToMySQL() {
    var data = tableToArrays();
    var types = readCurrentTypes();

    fetch('http://localhost:5000/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([data, types]),
    });
}

function readFromMySQL() {
    fetch('http://localhost:5000/api')
        .then(response => {
            return response.json()
        })
        .then(fullresponse => {
            console.log(fullresponse);

            var data = fullresponse[0];
            for(var i = data.length - 1; i >= 0; i--) {
                addTransaction([data[i].id, data[i].date, data[i].account, data[i].type, data[i].security, data[i].amount, data[i].dAmount, data[i].costBasis]);
            }

            var types = fullresponse[1];
            var typesArr = [];
            for(var i = 0; i < types.length; i++) {
                typesArr.push(types[i].typename);
            }
            setTransactionTypesList(typesArr);
        })
}

