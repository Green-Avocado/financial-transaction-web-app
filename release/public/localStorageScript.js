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
        document.getElementById('fileUploadLabel').innerHTML = String(fileIn.files.length) + " file(s)";
    }
    fileEditted = true;
    console.log("updated file upload");
}

function uploadFile(data, cb, fileList, index) {
    fileId = fileIdGenerator();
    fileIn = document.getElementById('fileUpload');
    if(fileIn.files && fileIn.files[index]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log(e.target.result);

            let bits = btoa(e.target.result);
            let ob = {
                id: fileId,
                type: fileIn.files[index].type,
                name: fileIn.files[index].name,
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
                fileList.push([fileId, fileIn.files[index].name]);
                index++;
                uploadFile(data, cb, fileList, index);
            }
        };
        reader.readAsBinaryString(fileIn.files[index])
    }
    else {
        removeFileUpload();
        data.push(fileList);
        cb(data);
    }
}

function addFile(fileIn, index) {
    fileId = fileIdGenerator();
    if(fileIn.files && fileIn.files[index]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log(e.target.result);

            let bits = btoa(e.target.result);
            let ob = {
                id: fileId,
                type: fileIn.files[index].type,
                name: fileIn.files[index].name,
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
                let table = fileIn.parentElement.getElementsByTagName('tbody')[0];
                let newRowContent = "<tr><td><a onclick='downloadFile(`" + fileId + "`);' href='javascript:void(0);'>" + fileIn.files[index].name + "</a></td>";
                newRowContent += "<td><button type='button' onclick='removeFileFromTable(`" + fileId + "`, this);'>-</button></td></tr>";
                table.innerHTML += newRowContent;
                index++;
                addFile(fileIn, index);
            }
        };
        reader.readAsBinaryString(fileIn.files[index])
    }
    else {
        fileIn.value = null;
    }
}

function updateExistingFileName(data) {
    for(let i = 0; i < data[0].getElementsByTagName('tr').length; i++) {
        let fileId = data[0].getElementsByTagName('tr')[i].getElementsByTagName('a')[0].getAttribute('onclick').split('`')[1];
        deleteFileFromIndexedDB(fileId);
    }

    var fileContent = '<table><tbody>';
    if(data.length > 1) {
        for(let i = 0; i < data[1].length; i++) {
            fileContent += "<tr><td><a onclick='downloadFile(`" + data[1][i][0] + "`);' href='javascript:void(0);'>" + data[1][i][1] + "</a></td>";
            fileContent += "<td><button type='button' onclick='removeFileFromTable(`" + data[1][i][0] + "`, this);'>-</button></td></tr>";
        }
    }
    fileContent += '</tbody></table><input type="file" onchange="addFile(this, 0);" multiple/>';
    data[0].innerHTML = fileContent;
}

function removeFileFromTable(fileId, cell) {
    var row = cell.parentElement.parentElement;

    if(confirm("Delete " + row.getElementsByTagName('a')[0].innerText + "?")) {
        row.parentElement.removeChild(row);
        deleteFileFromIndexedDB(fileId);
    }
}

function deleteFileFromIndexedDB(fileId) {
    let trans = db.transaction(['files'], 'readwrite');
    let addReq = trans.objectStore('files').delete(fileId);
}

function removeFileUpload() {
    document.getElementById('fileUpload').value = null;
    document.getElementById('fileUploadLabel').innerHTML = "Upload file";
    fileEditted = true;
}

function downloadFile(fileId) {
    console.log('downloading');
    var trans = db.transaction(['files'], 'readonly');
    var dlReq = trans.objectStore('files').get(fileId);
    
    dlReq.onerror = function(e) {
        console.log('error reading data');
        console.error(e);
    };
    
    dlReq.onsuccess = function(e) {
        console.log('data read');
        console.log(dlReq.result);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:' + dlReq.result.type + ';base64,' + dlReq.result.data);
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

