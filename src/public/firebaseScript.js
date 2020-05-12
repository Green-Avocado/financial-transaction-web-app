/*
 * This function is called before writing to the database in order to clear the old data.
 *
 * This is done using a built-in method pointing at the 'Data' reference, which contains all table data
 */
function clearFirebase() {
    firebase.database().ref('Data').remove();
}

/*
 * The function starts by clearing old data, then creates an array of all the data stored in the table.
 *
 * The array is created using the tableToArrays() function, which is contained in the googleApiScript.js file, as this perfectly suits both databases
 *
 * The for loop cycles through every top level array and sets a database object at the reference 'Data/#' where # is the position of the data
 * Data is stored in appropriately named fields
 */
function writeToFirebase() {
    clearFirebase();

    var data = tableToArrays();
    var typesArr = readCurrentTypes();

    for(var i = 0; i < data.length - 1; i++) {
        firebase.database().ref('Data/' + String(i)).set({
            id: data[i + 1][0],
            date: data[i + 1][1],
            account: data[i + 1][2],
            type: data[i + 1][3],
            security: data[i + 1][4],
            amount: data[i + 1][5],
            dAmount: data[i + 1][6],
            costBasis: data[i + 1][7]
        });
    }
    for(var i = 0; i < typesArr.length; i++) {
        firebase.database().ref('Types/' + String(i)).set({
            value: typesArr[i]
        });
    }
}

/*
 * This function uses the same loop at the start to clear the existing table as the Google Database script
 *
 * The function gets a snapshop of the database at the reference 'Data'.
 *
 * The 'once' method is used to specify that this should only be read once, and not checked for changes.
 *
 * The val() method of the snapshot is used to retrieve an array containing each object in the database.
 *
 * As the transactions were stored in fully formated form, the addTransaction function from the base app can be used to insert them.
 *
 * Rows are inserted in reverse order to preserve the order in which they were stored.
 */
function readFromFirebase() {
    return firebase.database().ref('/').once('value').then(function(snapshot) {

        while(document.getElementsByClassName('bodyRow').length > 0) {
            document.getElementById("tableBody").removeChild(document.getElementsByClassName('bodyRow')[0]);
        }

        data = snapshot.val().Data;
        for(var i = data.length - 1; i >= 0; i--) {
            addTransaction([data[i].id, data[i].date, data[i].account, data[i].type, data[i].security, data[i].amount, data[i].dAmount, data[i].costBasis]);
        }

        types = snapshot.val().Types;
        var typesArr = [];
        for(var i = 0; i < types.length; i++) {
            typesArr.push(types[i].value);
        }
        setTransactionTypesList(typesArr);
    });
}

function clearFirestore() {
    firestore.collection("Data").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            firestore.collection("Data").doc(doc.id).delete();
        });
    }).then(function() {
        firestore.collection("Types").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                firestore.collection("Types").doc(doc.id).delete();
            });
        })
    }).then(function() { return 0 });
}

function writeToFirestore() {
    firestore.collection("Data").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            firestore.collection("Data").doc(doc.id).delete();
        });
    }).then(function() {
        firestore.collection("Types").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                firestore.collection("Types").doc(doc.id).delete();
            });
        }).then(function() {
            var data = tableToArrays();
            var typesArr = readCurrentTypes();

            for(var i = 0; i < data.length - 1; i++) {
                firestore.collection("Data").add({
                    id: data[i + 1][0],
                    date: data[i + 1][1],
                    account: data[i + 1][2],
                    type: data[i + 1][3],
                    security: data[i + 1][4],
                    amount: data[i + 1][5],
                    dAmount: data[i + 1][6],
                    costBasis: data[i + 1][7],
                    index: i
                })
                .then(function(docRef) {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });
            }
            for(var i = 0; i < typesArr.length; i++) {
                firestore.collection("Types").add({
                    value: typesArr[i],
                    index: i
                })
                .then(function(docRef) {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(function(error) {
                    console.error("Error adding document: ", error);
                });
            }
        })
    });
}

function readFromFirestore() {
    firestore.collection("Data").get().then((querySnapshot) => {
        var data = [];

        querySnapshot.forEach((doc) => {
            data[doc.data().index] = doc.data();
        });

        while(document.getElementsByClassName('bodyRow').length > 0) {
            document.getElementById("tableBody").removeChild(document.getElementsByClassName('bodyRow')[0]);
        }

        for(var i = data.length - 1; i >= 0; i--) {
            addTransaction([data[i].id, data[i].date, data[i].account, data[i].type, data[i].security, data[i].amount, data[i].dAmount, data[i].costBasis]);
        }
    });

    firestore.collection("Types").get().then((querySnapshot) => {
        var typesArr = [];

        querySnapshot.forEach((doc) => {
            typesArr[doc.data().index] = doc.data().value;
        });

        setTransactionTypesList(typesArr);
    });
}

