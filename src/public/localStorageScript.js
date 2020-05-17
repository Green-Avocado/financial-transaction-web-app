let db;
let dbVersion = 1;
let dbReady = false;

var fileEditted = false;

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

function fileUploadChanged() {
    fileIn = document.getElementById('fileUpload');
    if(fileIn.files && fileIn.files[0]) {
        document.getElementById('fileUploadLabel').innerHTML = fileIn.files[0].name;
    }
    fileEditted = true;
    console.log("updated file upload");
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
                type: fileIn.files[0].type,
                name: fileIn.files[0].name,
                data: bits
            };

            let trans = db.transaction(['files'], 'readwrite');
            let addReq = trans.objectStore('files').put(ob);

            addReq.onerror = function(e) {
                console.log('error storing data');
                console.error(e);
            }

            trans.oncomplete = function(e) {
                console.log('data stored');
                data.push(fileIn.files[0].name);
                removeFileUpload();
                cb(data);
            }
        };
        reader.readAsBinaryString(fileIn.files[0])
    }
    else cb(data);
}

function updateExistingFileName(data) {
    if(data.length > 2) {
        data[1].innerHTML = "<a onclick='downloadFile(`" + data[0] + "`);' href='javascript:void(0);'>" + data[2] + "</a>"
    }
    else {
        data[1].innerHTML = '';
    }
}

function removeFileUpload() {
    document.getElementById('fileUpload').value = null;
    document.getElementById('fileUploadLabel').innerHTML = "Upload file";
    fileEditted = true;
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
        console.log(dlReq.result);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:' + dlReq.result.type + ';charset=utf-8,' + encodeURIComponent(dlReq.result.data));
        element.setAttribute('download', dlReq.result.name);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
}

window.onbeforeunload = function(){
    indexedDB.deleteDatabase('FileStorage');
}

