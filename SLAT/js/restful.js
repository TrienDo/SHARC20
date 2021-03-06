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
    
    //Working with Experience
    this.createExperience = function(experienceInfo)
    {
        //Assign id
        experienceInfo.id = getIdString();
        
        var data = JSON.stringify(experienceInfo);
        $.ajax({
            type:'POST',
            url: apiRoot + 'experiences',
            data: data,
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS)
                    startDesigningExperience(result.data)
                else
                    showMessage(result.data);
            }
        });
    }
    
    this.saveExperience = function(experienceInfo)
    {
        var data = JSON.stringify(experienceInfo);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'experiences/' + experienceInfo.id,
            data: data,
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status != SUCCESS)                    
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
                        presentAllExperience(result.data);
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
    
    this.getNumberOfResponses = function (experienceId)
    {
        $.ajax({
            type:'GET',
            url: apiRoot + 'responsesCount/' + designerInfo.id + '/'+ experienceId,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){                    
                    showNotification(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    
    
    this.getResponses = function (experienceId)
    {
        $.ajax({
            type:'GET',
            url: apiRoot + 'responses/' + designerInfo.id + '/'+ experienceId,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){                    
                    callbackFunctionForResponse(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
    }
    
    
    this.deleteExperience = function (experienceId){
        $.ajax({
            type:'DELETE',
            url: apiRoot + 'experiences/' + designerInfo.id + '/'+ experienceId,                        
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){                    
                    presentExperiencesDetail(result.data);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });
            
    }
    
    this.publishExperience = function(experienceInfo){
        var data = JSON.stringify(experienceInfo);
        $.ajax({
            type:'POST',
            url: apiRoot + 'publishExperience/' + curProject.id,
            data: data,
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS)
                    showExperienceSize(result.data)
                else
                    showMessage(result.data);
            }
        });
    }
    //For KML
    this.getExperienceSnapshot = function(){
        $.ajax({
            type:'GET',
            url: apiRoot + 'experienceSnapshot/' + designerInfo.id + '/' + curProject.id,
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS)
                    showExportDialog(result.data)
                else
                    showMessage(result.data);
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
    
    //Get mock location
    this.getMockLocation = function(designerId){
        $.ajax({
            type:'GET',
            url: apiRoot + 'locations/' + designerId,            
            success: function(result) {                
                if(result.status == SUCCESS)
                    renderLocation(result.data)
                else
                    showMessage(result.data);
            }
        });
    }
    
    //Set mock location
    this.setMockLocation = function(location){
        var data = {
            id: designerInfo.id,
            location: location
        };
        $.ajax({
            type:'PUT',
            url: apiRoot + 'locations',
            headers: { 'apiKey': designerInfo.apiKey},
            data: JSON.stringify(data),            
            success: function(result) {                
                if(result.status == SUCCESS){}
                    //renderLocation(result.data)
                else
                    showMessage(result.data);
            }
        });
    }
    
    //Working with POI
    this.createNewPoi = function (poiExperience)
    {
        //Assign id
        poiExperience.id = getIdString();
        var data = JSON.stringify(poiExperience);
        $.ajax({
            type:'POST',
            url: apiRoot + 'pois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoi(result.data, false);
                    //Upload media if the POI is created from a GPS-tagged photo
                    if(curMedia != null && curMedia.entityId ==-1)
                    {
                        //Upload the GPS image
                        showUploadingStatus("Please wait. Uploading data...");
                        curMedia.entityId = result.data.id;//return id of the current POI
                        cloudManager.uploadMedia(curMediaBank.id + ".jpg", curMediaData);                        
                    }
                    else if(curMedia != null && curMedia.entityId ==-2){//new media from a response
                        curMedia.entityId = result.data.id;//return id of the current POI
                        resfulManager.addMedia(curMedia);
                    }
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Update POI
    this.updatePoi = function (poiExperience)
    {
        var data = JSON.stringify(poiExperience);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'pois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoi(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Delete POI
    this.deletePoi = function (poiExperience)
    {
        var data = JSON.stringify(poiExperience);
        $.ajax({
            type:'DELETE',
            url: apiRoot + 'pois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoi(result.data, true);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Working with POI Type
    this.createPoiType = function (poiType)
    {
        //Assign id
        poiType.id = getIdString();
        
        var data = JSON.stringify(poiType);
        $.ajax({
            type:'POST',
            url: apiRoot + 'poiTypes',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoiType(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Update Poi Type
    this.updatePoiType= function (poiType)
    {
        var data = JSON.stringify(poiType);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'poiTypes',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoiType(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Delete Poi Type
    this.deletePoiType = function (poiType)
    {
        var data = JSON.stringify(poiType);
        $.ajax({
            type:'DELETE',
            url: apiRoot + 'poiTypes',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewPoiType(result.data, true);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    //Working with EOI
    this.createNewEoi = function (eoiExperience)
    {
        //Assign id
        eoiExperience.id = getIdString();
        
        var data = JSON.stringify(eoiExperience);
        $.ajax({
            type:'POST',
            url: apiRoot + 'eois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewEoi(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Update EOI
    this.updateEoi = function (eoiExperience)
    {
        var data = JSON.stringify(eoiExperience);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'eois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewEoi(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }    
    
    
    //Delete EOI
    this.deleteEoi = function (eoiExperience)
    {
        var data = JSON.stringify(eoiExperience);
        $.ajax({
            type:'DELETE',
            url: apiRoot + 'eois',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewEoi(result.data, true);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Working with Route
    this.createNewRoute = function (routeExperience)
    {
        //Assign id
        routeExperience.id = getIdString();
        
        var data = JSON.stringify(routeExperience);
        $.ajax({
            type:'POST',
            url: apiRoot + 'routes',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewRoute(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Update Route
    this.updateRoute = function (routeExperience)
    {
        var data = JSON.stringify(routeExperience);
        $.ajax({
            type:'PUT',
            url: apiRoot + 'routes',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewRoute(result.data, false);
                }
                else
                    showMessage(result.data);
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                showMessage(textStatus + ". " + errorThrown);
            }
        });    
    }
    
    //Delete Route
    this.deleteRoute = function (routeExperience)
    {
        var data = JSON.stringify(routeExperience);
        $.ajax({
            type:'DELETE',
            url: apiRoot + 'routes',
            data: data,                       
            headers: { 'apiKey': designerInfo.apiKey},
            success: function(result) {                
                if(result.status == SUCCESS){
                    presentNewRoute(result.data, true);
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
            url: apiRoot + 'mediaForEntity/' + designerInfo.id + '/' + curProject.id + '/' + entityId  + '/' + entityType,                                 
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

