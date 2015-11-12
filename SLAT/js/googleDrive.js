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
                $("#userAccount").html('Logged in as ' + designerName + '<img src="images/arrow.png" class="arrowMenu"/>');
                designerInfo = new SharcUser(0, designerName, resp.user.emailAddress, "", "", "Google Drive", resp.user.permissionId, "");            
                //showWelcomeDialog(designerName);  
                resfulManager.updateOrAddUser(designerInfo);
            } 
        });
    }

      
    this.createSharcFolder = function()
    {
        //check exist
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
                
                //request.execute(callback);
                request.execute(function(resp) {
                    SharcFolderId = resp.id;
                    var permissionBody = {
                        'value': '',
                        'type': 'anyone',
                        'role': 'reader'
                    };
                    var permissionRequest = gapi.client.drive.permissions.insert({
                        'fileId': resp.id,
                        'resource': permissionBody
                    });
                    permissionRequest.execute(function(resp) {
                        cloudManager.getWebViewLink();
                    });
                });
            }
            //Get user info
            cloudManager.getUserInfo();
        });
          
    }
    
    this.getWebViewLink = function()
    {
        var req = gapi.client.drive.files.get({
            'fileId': SharcFolderId
        });
        req.execute(function(resp) {
            SharcWebViewLink = resp.webViewLink;            
        });
    }
}
    