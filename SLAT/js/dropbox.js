/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Interacting with Dropbox   
*/ 
var DROPBOX_APP_KEY = 'ggludz9cg3xq1lq';
var DROPBOX_APP_SECRET = '9zeykvpdfuwlzo7';
var REQUEST_HEADER = "";
var logedIn = false;
var designerInfo = null;
var projectID ="";
var databaseHandle = "";
var databaseRevision = "";
var allMedia = new Array();//Store all media items
    
function SharcDropBox()
{      
    //////////////////////AUTHENTICATION/////////////////////////////
    this.logIn = function()////Step 1 + 2 of authentication.
    {              
        if(!logedIn)
        {
            //https://www.dropbox.com/developers/blog/20/using-oauth-10-with-the-plaintext-signature-method
            //POST https://api.dropbox.com/1/oauth/request_token
            //Your HTTP request should have the following header:
            //Authorization: OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="<app-key>", oauth_signature="<app-secret>&"
            //Step 1: Obtain an OAuth request token to be used for the rest of the authentication process.
            
            $.ajax({
                type:'POST',
                url: 'https://api.dropbox.com/1/oauth/request_token',
                headers: { 'Authorization': 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ DROPBOX_APP_KEY + '", oauth_signature="'+ DROPBOX_APP_SECRET + '&"' },
                success: function(data) {                
                    var params = parseQueryString(data);
                    localStorage.setItem("oauth_token",params["oauth_token"]);
                    localStorage.setItem("oauth_token_secret",params["oauth_token_secret"]);
                    //Step 2: Applications should direct the user to /oauth/authorize.
                    window.location.href = 'https://www.dropbox.com/1/oauth/authorize?oauth_token=' + params["oauth_token"] + '&oauth_callback=http://' + callbackURL;
                }
            });
        }
        else
        {
            logedIn = false;
            $("#userAccount").text("Your account");
            $('#logIn').text("Log in");
            localStorage.setItem("oauth_token","");
            localStorage.setItem("oauth_token_secret","");            
            window.location.href = 'http://' + callbackURL;
            showMenu(false);
        }
    }
    
    this.getAccessToken = function (token)//Step 3 of authentication. After the /oauth/authorize step is complete, the application can call /oauth/access_token to acquire an access token.
    {
        $.ajax({
            type:'POST',
            url: 'https://api.dropbox.com/1/oauth/access_token',
            headers: { 'Authorization': 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ DROPBOX_APP_KEY + '", oauth_token="' + localStorage.getItem("oauth_token") + '", oauth_signature="' + DROPBOX_APP_SECRET + '&' + localStorage.getItem("oauth_token_secret")+'"' },
            success: function(data) {
                var params = parseQueryString(data);
                localStorage.setItem("oauth_token",params["oauth_token"]);
                localStorage.setItem("oauth_token_secret",params["oauth_token_secret"]);
                REQUEST_HEADER = 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ DROPBOX_APP_KEY + '", oauth_token="' + localStorage.getItem("oauth_token") + '", oauth_signature="' + DROPBOX_APP_SECRET + '&' + localStorage.getItem("oauth_token_secret")+'"';
                $('#logIn').text("Log out");
                //Get user info
                $.ajax({
                    type:'GET',
                    url: 'https://api.dropbox.com/1/account/info',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {                        
                        var result = JSON.parse(data);
                        $("#userAccount").html('Logged in as ' + result.display_name + '<img src="images/arrow.png" class="arrowMenu"/>');
                        designerInfo = new SharcUser(0, result.display_name, result.email, "", "", "Dropbox", result.uid, "", "");
                        logedIn = true;   
                        showMenu(true);                          
                        resfulManager.updateOrAddUser(designerInfo);                                   
                    },
                    error: function(jqXHR, textStatus, errorThrown ) {
                        showMessage("Error: " + textStatus + " because:" + errorThrown);
                    }
                });                                  
            }
        });         
    }     
     
    
    this.saveSnapshot = function(filename,mdata)//save data to a file in Dropbox and share it with everyone
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',            
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);
                //Share to get public URL and update Project table
                //1. Share the file                
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/shares/auto' + result.path + '?short_url=false',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {
                        var rs = JSON.parse(data);
                        var url = rs.url;
                        url = url.substring(0,url.lastIndexOf("?"));
                        url = url.replace("https://www.drop","https://dl.drop");
                        //2. Update MySQL database
                        var proCenter = getExperienceBoundary().getCenter();
                        $.post(
                            'php/updateProjectURL.php',
                            {
                                proAuthID: designerInfo.id,
                                proPath: projectID,            
                                proPublicURL: url,
                                proLocation: proCenter.lat() + " " + proCenter.lng()
                            },
                            function(data,status){
                                var result = JSON.parse(data);
                                if(result.success == 1)
                                {    
                                    showMessage("A new snapshot of the current experience has been created and saved in your dropbox folder Dropbox\\Apps\\SharcAu.");
                                }
                                else
                                    showMessage("Error when creating a new snapshot of the current experience: " + result.message);
                        });
                    }
                });                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when saving file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
                           
    
    this.saveKmlFile = function(filename,mdata)//Save data to file in Dropbox
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename +'?overwrite=false&autorename=true',
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',            
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);
                showMessage("The KML file has been saved in your Dropbox account as Dropbox\\Apps\\" + result.path.substring(1));
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when saving file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.saveExperienceThumbnail = function(filename,mdata)//Save data to file in Dropbox
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',  
            processData: false,          
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);
                //Share to get public URL and update Project table
                //1. Share the file                
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/shares/auto' + result.path + '?short_url=false',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {
                        var rs = JSON.parse(data);
                        var url = rs.url;
                        url = url.substring(0,url.lastIndexOf("?"));
                        url = url.replace("https://www.drop","https://dl.drop");    
                        publishExperienceData(url);  
                    }
                });                
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when publishing an experience: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    this.uploadMedia = function(filename,mdata)
    {        
        $.ajax({
            type:'POST',
            url: 'https://api-content.dropbox.com/1/files_put/auto/' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',
            processData: false,
            data: mdata,
            success: function(data) {                
                var result = JSON.parse(data);  
                //Update size for media
                curMediaBank.size = result.bytes;                
                               
                //Share data                
                $.ajax({
                    type:'POST',
                    url: 'https://api.dropbox.com/1/shares/auto' + result.path + '?short_url=false',
                    dataType: 'html',
                    headers: { 'Authorization': REQUEST_HEADER },
                    success: function(data) {
                        var rs = JSON.parse(data);
                        var url = rs.url;
                        url = url.substring(0,url.lastIndexOf("?"));
                        url = url.replace("https://www.drop","https://dl.drop");
                        curMediaBank.content = url;
                        resfulManager.addMedia(curMedia);                        
                    },
                    error: function(jqXHR, textStatus, errorThrown ) {
                        showMessage("Error when sharing data: " + textStatus + " because:" + errorThrown);
                    }
                });                  
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when uploading file: " + textStatus + " because:" + errorThrown);
            }
        });
    }
    
    
    this.deleteFile = function(filename)
    {                
        //remove media from array
        var delId = filename.substring(1,filename.lastIndexOf("."));
        removeMediaFromArray(delId);
        //Delete file on server    
        $.ajax({
            type:'POST',                 
            url: 'https://api.dropbox.com/1/fileops/delete?root=auto&path=' + filename,
            headers: { 'Authorization': REQUEST_HEADER, 'Content-Type': 'text/plain'},
            dataType: 'html',
            success: function(data) {                            
                var result = JSON.parse(data);                                                                  
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage("Error when deleting file: " + textStatus + " because:" + errorThrown);
            }
        });
    } 
}

//Parse URL to get parameters
function parseQueryString(query) 
{         
    //example param1=value1&param2=value2
    var dropbox_param = {};
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) 
    {
        var pair = vars[i].split("=");
        if(pair.length > 1)
    	   dropbox_param[pair[0]] = pair[1];    	
    }
    return dropbox_param;        
}