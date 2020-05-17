let db;
let dbVersion = 1;
let dbReady = false;

function initDb() {
    let reset = indexedDB.deleteDatabase('FileStorage');
    reset.onsuccess = function(a) {
        let request = indexedDB.open('FileStorage', dbVersion);

        request.onerror = function(e) {
            console.error('Unable to open database.');
        }

        request.onsuccess = function(e) {
            db = e.target.result;
            console.log('db opened');
        }

        request.onupgradeneeded = function(e) {
            let db = e.target.result;
            db.createObjectStore('files', {keyPath:'id', autoIncrement: false});
            dbReady = true;
        }
    }
}

function uploadFile(fileId, data, cb) {
    fileIn = document.getElementById('fileUpload');
    if(fileIn.files && fileIn.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log(e.target.result);

            let bits = e.target.result;
            let ob = {
                id: fileId,
                name: fileIn.files[0].name,
                data: bits
            };

            let trans = db.transaction(['files'], 'readwrite');
            let addReq = trans.objectStore('files').add(ob);

            addReq.onerror = function(e) {
                console.log('error storing data');
                console.error(e);
            }

            trans.oncomplete = function(e) {
                console.log('data stored');
                cb(data, fileIn.files[0].name);
            }
        };
        reader.readAsBinaryString(fileIn.files[0])
    }
}

function removeFile() {
    document.getElementById('fileUpload').value = null;
}

function downloadFile(fileId) {
    console.log('downloading');
    var trans = db.transaction(['files'], 'readwrite');
    var dlReq = trans.objectStore('files').get(fileId);
    
    dlReq.onerror = function(e) {
        console.log('error reading data');
        console.error(e);
    };
    
    dlReq.onsuccess = function(e) {
        console.log('data read');
        console.log(dlReq.result.data);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:' + fileUpload.files[0].type + ';charset=utf-8,' + encodeURIComponent(dlReq.result.data));
        element.setAttribute('download', dlReq.result.name);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
}

