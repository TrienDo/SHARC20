var apiRoot = '../api/v1/';
function SharcRestful()
{         
    //When the designer logs into SLAT, store details about her dropbox account in a MySQL db
    this.updateOrAddUser = function(userInfo)
    {  
        //Assign id
        userInfo.id = getIdString();
        
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
   
    
    
    this.getExperienceList = function()
    {
        $.ajax({
            type:'GET',
            url: apiRoot + 'experiencesForSpvt/' + designerInfo.id,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    if(result.data.length > 0)
                        presentAllExperience(result.data);
                    else 
                        askToSwitchAccount();
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
            url: apiRoot + 'experienceSnapshotForSpvt/' + experienceId + '/' + designerInfo.id,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){                    
                    renderExperience(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    
    
    
    
    //For consumer
    this.getExperienceSnapshotForConsumer = function(proId){
        $.ajax({
            type:'GET',
            url: apiRoot + 'experienceSnapshot/' + proId,            
            success: function(result) {                
                if(result.status == SUCCESS)
                    renderExperience(result.data)
                else
                    showMessage(result.data);
            }
        });
    }
    
 
    
    //Working with Media
    this.addMedia = function(mediaExperience)
    {
        //Assign id
        mediaExperience.id = getIdString();
        
        var data = JSON.stringify(mediaExperience);
        $.ajax({
            type:'POST',
            url: apiRoot + 'media',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewMedia(result.data, 1);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });   
    }
    
    this.getMedia = function(mediaExperienceId)
    {        
        $.ajax({
            type:'GET',
            url: apiRoot + 'media/' + mediaExperienceId,                                
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    viewEditMediaItem(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });   
    }
    
    this.getMediaLibrary = function(designerId){
        $.ajax({
            type:'GET',
            url: apiRoot + 'mediaLibrary/' + designerId,                                
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentAllMedia(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    
    this.updateMedia = function(mediaExperience)
    {        
        var data = JSON.stringify(mediaExperience);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'media',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewMedia(result.data, 0);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });   
    }
    
    this.deleteMedia = function(mediaId)
    {               
        $.ajax({
            type:'DELETE',
            url: apiRoot + 'media/' + mediaId,            
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewMedia(result.data, -1);
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
    
    
    //get media items for an entity
    this.getMediaForEntity = function(entityType, entityId){
        var data = {
            entityType: entityType,
            entityId: entityId,
            experienceId: curProject.id,
            designerId: designerInfo.id
        };
        $.ajax({
            type:'GET',
            url: apiRoot + 'mediaForEntityForSpet/' + curProject.id + '/' + entityId  + '/' + entityType,                                 
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    viewAllMediaItems(result.data);	
                }
                else {
                    showMessage(result.data);                    
                }    
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    
    //get media items for an entity
    this.updateMediaOrderForEntity = function(entityType, entityId, mediaOrder){
        var data = {            
            mediaOrder: mediaOrder
        };
        $.ajax({
            type:'PUT',
            url: apiRoot + 'mediaForEntity/' + designerInfo.id + '/' + curProject.id + '/' + entityId  + '/' + entityType,
            data: JSON.stringify(data),                                 
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    //viewAllMediaItems(result.data);	
                }
                else {
                    showMessage(result.data);                    
                }    
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    //moderate a response
    this.updateResponseStatus = function(response){
        var data = JSON.stringify(response);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'responses',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    //presentNewMedia(result.data, 1);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });   
    }
}

