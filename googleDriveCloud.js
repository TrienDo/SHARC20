// Your Client ID can be retrieved from your project in the Google
      // Developer Console, https://console.developers.google.com
      var CLIENT_ID = '452646070224-dp958da2i0ttvb7bonakvone42dd7jjp.apps.googleusercontent.com';

      var SCOPES = [                    
                    'https://www.googleapis.com/auth/drive.file'
                    ];

      /**
       * Check if current user has authorized this application.
       */
      var SharcFolderId = "";
      var SharcWebViewLink = "";
      function checkAuth() {
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          //loadDriveApi();
          //create SHARC20 folder if not existed
          gapi.client.load('drive', 'v2',createSharcFolder);
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }
      
    function createSharcFolder()
    {
        //check exist
        var request = gapi.client.drive.files.list({"q":"mimeType='application/vnd.google-apps.folder' and trashed=false and title='SHARC20' and 'root' in parents"});
        request.execute(function(resp) {
            if (resp.items.length > 0) {
                SharcFolderId = resp.items[0].id; 
                appendPre("SharcFolderId:" + SharcFolderId);
                getWebViewLink();
            } 
            else {
                appendPre('No files found.');
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
                    appendUser(resp.id);
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
                        getWebViewLink();
                    });
                });
            }
        });
          
    }
    
    function getWebViewLink()
    {
        var req = gapi.client.drive.files.get({
            'fileId': SharcFolderId
        });
        req.execute(function(resp) {
            SharcWebViewLink = resp.webViewLink;
            appendUser("WebViewLink:" + SharcWebViewLink);
        });
    }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Drive API client library.
       */
      function loadDriveApi() {
        gapi.client.load('drive', 'v2', listFiles);
      }

      /**
       * Print files.
       */
      function listFiles() {
        var request = gapi.client.drive.files.list({
            'maxResults': 20
          });

          request.execute(function(resp) {
            appendPre('Files:');
            var files = resp.items;
            if (files && files.length > 0) {
              for (var i = 0; i < files.length; i++) {
                var file = files[i];
                appendPre(file.title + ' (' + file.id + ')');
              }
            } else {
              appendPre('No files found.');
            }
          });
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('output');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }
      
       /**
       * Print files.
       */
      function getUserInfo() {
        var request = gapi.client.drive.about.get();

          request.execute(function(resp) {
            
            
            if (resp) {
              appendUser(resp.user.displayName + ":" + resp.user.permissionId + ":" + resp.user.emailAddress);
            } else {
              appendUser('No files found.');
            }
          });
      }
      
      function appendUser(message) {
        var pre = document.getElementById('userInfo');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }
      
      
      /**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFile(fileData, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    var metadata = {
      'title': fileData.name,
      'mimeType': contentType,
      'parents':[{"id":SharcFolderId}]
    };

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    //request.execute(callback);
    request.execute(function(resp) {
            
            
            if (resp.error == null) {
                //Share file
                /*var body = {                    
                    'value': '',
                    'type': 'anyone',
                    'role': 'reader'
                };
                var request = gapi.client.drive.permissions.insert({
                    'fileId': resp.id,
                    'resource': body
                });
                request.execute(function(resp) { });
                */
  
                //image                
                //document.getElementById("uploadedImage").src = SharcWebViewLink + resp.title;//Store this link in database = its id? 
                
                //audio
                /*
                var audio = document.getElementById('audioControl');
                var source = document.getElementById('uploadedAudio');
                source.src= SharcWebViewLink + resp.title;
                audio.load(); //call this to just preload the audio without playing
                audio.play(); //call this to play the song right away
                */
                
                //video
                
                var video = document.getElementById('videoControl');
                var source = document.getElementById('uploadedVideo');
                source.src= SharcWebViewLink + resp.title;
                video.load(); //call this to just preload the audio without playing
                video.play(); //call this to play the song right away
                
                
            } 
            else {
                appendUser(resp.error.message);
            }
          });
  }
}

function deleteAppFiles()
{
    var request = gapi.client.drive.files.list({"q": "'" + SharcFolderId  + "'"+ " in parents"});
    request.execute(function(resp) {
       if (resp.items.length > 0) {
            for (var i=0; i < resp.items.length; i++)
            {
                var req = gapi.client.drive.files.delete({'fileId': resp.items[i].id});
                req.execute(function(resp) { });
            }
       }
    });
}

function uploadFileDone()
{
    alert("Done uploading file");
}