function writeImagesToFirestore(database) {
    firestore.collection("Images:" + database).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            firestore.collection("Images:" + database).doc(doc.id).delete();
        });
    }).then(function() {
        var trans = db.transaction(['files'], 'readonly');
        var dlReq = trans.objectStore('files').getAll();
        
        dlReq.onerror = function(e) {
            console.log('error reading data');
            console.error(e);
        };
        
        dlReq.onsuccess = function(e) {
            console.log(dlReq.result);

            for(let i = 0; i < dlReq.result.length; i++) {
                firestore.collection("Images:" + database).add({
                    id: dlReq.result[i].id,
                    type: dlReq.result[i].type,
                    name: dlReq.result[i].name,
                    data: dlReq.result[i].data,
                })
                .then(function(docRef) {
                    console.log("Image written with ID: ", docRef.id);
                })
                .catch(function(error) {
                    console.log("Error adding image: ", error);
                });
            }
        };
    });
}

function readImagesFromFirestore(database) {
    firestore.collection("Images:" + database).get().then((querySnapshot) => {
        let trans = db.transaction(['files'], 'readwrite');

        trans.oncomplete = function(e) {
            console.log('data stored');
        }

        querySnapshot.forEach((doc) => {
            console.log("Writing ", doc.data().name);

            let ob = {
                id: doc.data().id,
                type: doc.data().type,
                name: doc.data().name,
                data: doc.data().data
            };

            let addReq = trans.objectStore('files').put(ob);
        });
    });
}

