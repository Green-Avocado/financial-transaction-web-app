function clearFirebase() {
    firebase.database().ref('Data').remove();
    firebase.database().ref('Types').remove();
}

function writeToFirebase() {
    writeImagesToFirestore("firebase");
    clearFirebase();

    var data = tableToArrays();
    var typesArr = readCurrentTypes();

    for(var i = 1; i < data.length; i++) {
        firebase.database().ref('Data/' + String(i - 1)).set({
            id: data[i][0],
            date: data[i][1],
            account: data[i][2],
            type: data[i][3],
            security: data[i][4],
            amount: data[i][5],
            dAmount: data[i][6],
            costBasis: data[i][7],
            files: data[i][8]
        });
    }
    for(var i = 0; i < typesArr.length; i++) {
        firebase.database().ref('Types/' + String(i)).set({
            value: typesArr[i]
        });
    }
}

function readFromFirebase() {
    clearIndexedDb("firebase");
    return firebase.database().ref('/').once('value').then(function(snapshot) {

        while(document.getElementsByClassName('bodyRow').length > 0) {
            document.getElementById("tableBody").removeChild(document.getElementsByClassName('bodyRow')[0]);
        }

        data = snapshot.val().Data;
        console.log(data);
        for(var i = data.length - 1; i >= 0; i--) {
            let staged = [data[i].id, data[i].date, data[i].account, data[i].type, data[i].security, data[i].amount, data[i].dAmount, data[i].costBasis];
            if(parseFileNamesIds(data[i].files).length > 0) {
                staged.push(parseFileNamesIds(data[i].files));
            }
            console.log(staged);
            addTransaction(staged);
        }

        types = snapshot.val().Types;
        var typesArr = [];
        for(var i = 0; i < types.length; i++) {
            typesArr.push(types[i].value);
        }
        setTransactionTypesList(typesArr);
        loadDataLists();
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
    writeImagesToFirestore("firestore");
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

            for(var i = 1; i < data.length; i++) {
                firestore.collection("Data").add({
                    id: data[i][0],
                    date: data[i][1],
                    account: data[i][2],
                    type: data[i][3],
                    security: data[i][4],
                    amount: data[i][5],
                    dAmount: data[i][6],
                    costBasis: data[i][7],
                    files: data[i][8],
                    index: i - 1
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
    clearIndexedDb("firestore");
    firestore.collection("Data").get().then((querySnapshot) => {
        var data = new Array();

        querySnapshot.forEach((doc) => {
            data[doc.data().index] = doc.data();
            console.log(data);
        });

        while(document.getElementsByClassName('bodyRow').length > 0) {
            document.getElementById("tableBody").removeChild(document.getElementsByClassName('bodyRow')[0]);
        }

        for(let i = data.length - 1; i >= 0; i--) {
            let staged = [data[i].id, data[i].date, data[i].account, data[i].type, data[i].security, data[i].amount, data[i].dAmount, data[i].costBasis];
            if(parseFileNamesIds(data[i].files).length > 0) {
                staged.push(parseFileNamesIds(data[i].files));
            }
            console.log(staged);
            addTransaction(staged);
        }
        loadDataLists();
    });

    firestore.collection("Types").get().then((querySnapshot) => {
        var typesArr = [];

        querySnapshot.forEach((doc) => {
            typesArr[doc.data().index] = doc.data().value;
        });

        setTransactionTypesList(typesArr);
    });
}

