var apiRoot = '../api/v1/';
function SharcRestful()
{         
    //When the designer logs into SLAT, store details about her dropbox account in a MySQL db
    this.updateOrAddUser = function(userInfo)
    {  
        var data = JSON.stringify(userInfo);
        $.post(
            apiRoot + 'users',
            data,        
            function(result,status){
                if(result.status == SUCCESS)
                {
                    designerInfo = result.data;
                    showWelcomeDialog(designerInfo.username);
                }
                else
                    showMessage(result.data);
            }            
        );    
    }
    
    this.createExperience = function(experienceInfo)
    {
        var data = JSON.stringify(experienceInfo);
        $.ajax({
            type:'POST',
            url: apiRoot + 'experiences',
            data: data,
            //dataType: 'html',
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS)
                    startDesigningExperience(result.data)
                else
                    showMessage(result.data);
            }
        });
    }
    
    this.getExperienceList = function()
    {
        $.ajax({
            type:'GET',
            url: apiRoot + 'experiences/' + designerInfo.id,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    if(result.data.length > 0)
                        presentAllProject(result.data);
                    else 
                        askToCreateNewProject();
                }
                else
                    showMessage(result.data);
            },
            error: function(result) {                
                showMessage(result);
            }

        });    
    }
                       
    
    this.loadExperience = function (experienceId)
    {
        $.ajax({
            type:'GET',
            url: apiRoot + 'experiences/' + designerInfo.id + '/'+ experienceId,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){                    
                    renderProject(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    
    //Working with POI
    this.createNewPoi = function (poiExperience)
    {
        var data = JSON.stringify(poiExperience);
        $.ajax({
            type:'POST',
            url: apiRoot + 'pois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoi(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Working with Media
    this.addMedia = function(mediaExperience)
    {
        $("#dialog-status").dialog("close");
        var data = JSON.stringify(mediaExperience);
        $.ajax({
            type:'POST',
            url: apiRoot + 'media',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewMedia(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });   
    }
    
    //Compress image
    this.compressImage = function()
    {
        var data = {
            imageData: curMediaData,
            fileName: designerInfo.id
        };
        $.ajax({
            type:'POST',
            url: apiRoot + 'mediaCompress',
            data: JSON.stringify(data),                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    //Get the compressed image back
                    var oReq = new XMLHttpRequest();
                    oReq.open("GET", apiRoot + 'data/' + result.data, true);
                    oReq.responseType = "arraybuffer";                        
                    oReq.onload = function(oEvent) 
                    {
                      var blob = new Blob([oReq.response], {type: "image/jpg"});
                      curMediaData = blob;                              
                      $('.ui-dialog-titlebar').show();
                      $("#dialog-status").dialog("close");                        
                    };                        
                    oReq.send();	
                }
                else
                {
                    showMessage(result.data);
                    $("#dialog-status").dialog("close");
                }    
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
}

