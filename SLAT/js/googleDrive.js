/*
    Author:     Trien Do    
    Created:    Nov 2015
    Tasks:      Interacting with Google Drive   
*/

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '452646070224-dp958da2i0ttvb7bonakvone42dd7jjp.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/drive.file'];
var SharcFolderId = "";
var SharcWebViewLink = "";
 
function SharcGoogleDrive()
{
    this.getMaxSize = function(){
        return 250;
    }
    
    //////////////////////AUTHENTICATION/////////////////////////////     
    this.logIn = function()
    {     
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES.join(' '), immediate: false},
            cloudManager.handleAuthResult
        );
    }
    
    /**
    * Handle response from authorization server.
    * @param {Object} authResult Authorization result.
    */
    this.handleAuthResult = function(authResult) {        
        if (authResult && !authResult.error) {                        
            logedIn = true;   
            showMenu(true);            
            //create SHARC20 folder if not existed
            gapi.client.load('drive', 'v2',cloudManager.createSharcFolder);
        }
    }
    
    this.getUserInfo = function() {
        var request = gapi.client.drive.about.get();
        request.execute(function(resp) {
            if (resp) {
                var designerName =  resp.user.displayName;
                $("#userAccount").html(designerName + '@GoogleDrive<img src="images/arrow.png" class="arrowMenu"/>');
                designerInfo = new SharcUser(0, designerName, resp.user.emailAddress, "", "", "Google Drive", resp.user.permissionId, "", "");            
                //showWelcomeDialog(designerName);  
                resfulManager.updateOrAddUser(designerInfo);
            } 
        });
    }

      
    this.createSharcFolder = function()
    {
        //check exist
        try{
        var request = gapi.client.drive.files.list({"q":"mimeType='application/vnd.google-apps.folder' and trashed=false and title='SHARC20' and 'root' in parents"});
        request.execute(function(resp) {
            if (resp.items.length > 0) {
                SharcFolderId = resp.items[0].id;
                cloudManager.getWebViewLink();
            } 
            else {                
                //Create
                var body = {
                    'title': 'SHARC20',        
                    'mimeType': 'application/vnd.google-apps.folder'
                }
                var request = gapi.client.drive.files.insert({
                    'resource': body
                });                
                request.execute(function(resp) {
                    SharcFolderId = resp.id;
                    cloudManager.shareSharcFolder();                    
                });
            }            
        });
        }
        catch(e){
            alert("Error:" + e.message);
        }
        
          
    }
    
    this.shareSharcFolder = function(){
        var permissionBody = {
            'value': '',
            'type': 'anyone',
            'role': 'reader'
        };
        var permissionRequest = gapi.client.drive.permissions.insert({
            'fileId': SharcFolderId,
            'resource': permissionBody
        });
        permissionRequest.execute(function(resp) {
            cloudManager.getWebViewLink();
        });
    }
    
    this.getWebViewLink = function()
    {
        var req = gapi.client.drive.files.get({
            'fileId': SharcFolderId
        });
        req.execute(function(resp) {
            SharcWebViewLink = resp.webViewLink;    
            //Get user info
            cloudManager.getUserInfo();        
        });
    }
    
    this.uploadMedia = function(filename, mdata)
    {        
        if(curBrowsingType == "image"){//convert Blob to base64 for image
            var reader = new window.FileReader();
            //reader.readAsDataURL(mdata);
            reader.readAsBinaryString(mdata); 
            reader.onloadend = function() {                           
                uploadFile(filename, reader.result);
            }
        }
        else
            uploadFile(filename, mdata);    
    }
    
    this.updateMedia = function (fileId, data){
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        
        var base64Data = btoa(data);
        
        var contentType = 'application/octet-stream';
        var metadata = {
            'mimeType': contentType,
            'parents':[{"id":SharcFolderId}]
        };            
        
        var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' +
                                    JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' +
                                    'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
        
        var request = gapi.client.request({
            'path': '/upload/drive/v2/files/' + fileId,
            'method': 'PUT',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        
        //request.execute(callback);
        request.execute(function(resp) {
            if (resp.error == null) {
                //goBack();
            } 
            else {
                showMessage(resp.error.message);
            }
        });
        
    }
    
    this.saveExperienceThumbnail = function(filename, data, thumnailPath)//Save experience thumbnail 
    {        
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        
        var base64Data = btoa(data);
        
        var contentType = 'application/octet-stream';
        var metadata = {
            'title': filename,
            'mimeType': contentType,
            'parents':[{"id":SharcFolderId}]
        };            
        
        var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' +
                                    JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' +
                                    'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
        
        var lApiPath = "";
        var method = "PUT";
        if(thumnailPath == "" || thumnailPath == null) {//first time -> upload new file
            method = "POST";
            lApiPath = '/upload/drive/v2/files';
        }
        else {//update file
            lApiPath = '/upload/drive/v2/files/' + thumnailPath.substr(0,thumnailPath.lastIndexOf("###"));//get id from path
        }        
        var request = gapi.client.request({
            'path': lApiPath,
            'method': method,
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        
        request.execute(function(resp) {
            if (resp.error == null) {
                publishExperienceData(resp.id + "###" + SharcWebViewLink + resp.title);
            } 
            else {
                showMessage(resp.error.message);
            }
        });
    }  
    
    this.saveKmlFile = function(filename, data)//Save experience thumbnail 
    {        
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        
        var base64Data = btoa(data);
        
        var contentType = 'application/octet-stream';
        var metadata = {
            'title': filename,
            'mimeType': contentType,
            'parents':[{"id":SharcFolderId}]
        };            
        
        var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' +
                                    JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' +
                                    'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
        
        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        
        //request.execute(callback);
        request.execute(function(resp) {
            if (resp.error == null) {
                showMessage("The KML file has been saved in your Dropbox account as Google Drive\\SHARC20\\" + resp.title);
            } 
            else {
                showMessage(resp.error.message);
            }
        });
    }                              
                    
}

function uploadFile(filename, data)
{
    if(SharcWebViewLink == "" || SharcWebViewLink == undefined){
        cloudManager.shareSharcFolder();
        showMessage("Sorry, there was an error. Please try again");
        return;
    }
    
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    
    var base64Data = btoa(data);
    
    var contentType = 'application/octet-stream';
    var metadata = {
        'title': filename,
        'mimeType': contentType,
        'parents':[{"id":SharcFolderId}]
    };            
    
    var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' +
                                JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' +
                                'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
    
    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    
    //request.execute(callback);
    request.execute(function(resp) {
        if (resp.error == null) {
            //alert("Returned object:" + JSON.stringify(resp));
            curMediaBank.size = resp.fileSize;                
            curMediaBank.content = SharcWebViewLink + resp.title;
            curMediaBank.fileId = resp.id;
            resfulManager.addMedia(curMedia);
        } 
        else {
            showMessage(resp.error.message);
        }
    });
}
    