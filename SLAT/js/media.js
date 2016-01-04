/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Provides functions relating to media items of POIs/EOIs/Routes    
*/ 

var audioByRecording = false;
//Variable to record the current state so appropriate dialogs can be opened again when a task is done
var POI_FORM = 1;       //POI form
var VIEW_FORM = 2;      //View all media form
var MAIN_FORM = 3;      //Main form with map
var EOI_FORM = 4;       //EOI form
var ROUTE_FORM = 5;
var callFrom = 0;       //form call new Media
var openFrom = 0;
var isChangingMediaOrder = false;
var curMediaType = "";  //whether the current media is associated with POI - EOI - Route - Response


function showUploadingStatus(message)
{
    $(function() {        
        $('#dialog-status').html('');                       
        $('#dialog-status').append('<div class="statusBox"><img src="images/waiting.gif" hspace="10"/><label>' + message + '</label></div>');
        $("#dialog-status").dialog({
            closeOnEscape: false,
            //open: function(event, ui) { $('.ui-dialog-titlebar').hide();},
            modal: true,
            height: 130,
            width:400,
            position: ['center','middle']            
        });
    });
}

function selectMediaSource()
{
    //window.location.href = 'http://' + callbackURL;
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Sharc Locative media Authoring Tool"});
    $('#dialog-message').append('<p>Where do you want to add media from</p>');
    $( "#dialog-message" ).dialog({
        modal: true,            
        height: 250,
        width: 400,            
        buttons: {
            "Your media library": function() {                
           	    $( this ).dialog("close");
                Library_showMediaLibrary();                                
            }, 
            "Your local machine": function() {                
           	    $( this ).dialog("close");
                selectMediaType();
            }            
        }
    });
}

//Dialog for designer to select type of media item: text - image - audio - video
function selectMediaType()
{
    $(function() {        
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Selecting media type" });
        var content = '<div class="formLabel">Please select the type of media you want to add</div>' 
                    + '<form id="selectMediaType"><table border="0" cellpadding="1" cellspacing="1" class="inputText">'
                    +  '<tbody>'
                    +   '<tr>'
                    +       '<td class="formText"><input type="radio" name="mediaType" class="inputCheckbox"   value="text"> Text</td>'
                    + '		<td class="formText"><input type="radio" name="mediaType" class="inputCheckbox"   value="image" checked> Photo (*.png, jpg, gif, bmp)</td>'                    
                    + '	</tr>'
                    + ' <tr>'    	            
                    + '     <td class="formText"><input type="radio" name="mediaType" class="inputCheckbox"   value="video"> Video (*.mp4)</td>'
                    + '      <td class="formText"><input type="radio" name="mediaType" class="inputCheckbox"   value="audio"> Audio (*.mp3, wav)</td>'
    	            + '	</tr>'
                    //+ ' <tr>'    	            
                    //+ '     <td colspan="2" class="formText"><button class="googleLookAndFeel" id="dropboxBrowser"> Browse from my library </button></td>'                    
    	            //+ '	</tr>'
 	                + '</tbody>'
                    + '</table></form>';        
        $('#dialog-message').append(content); 
        
        $("#dropboxBrowser").click(function() {
            options = {
                // Required. Called when a user selects an item in the Chooser.
                success: function(files) {
                    alert("Here's the file link: " + files[0].link)
                },
            
                // Optional. Called when the user closes the dialog without selecting a file
                // and does not include any parameters.
                cancel: function() {
            
                },
            
                // Optional. "preview" (default) is a preview link to the document for sharing,
                // "direct" is an expiring link to download the contents of the file. For more
                // information about link types, see Link types below.
                linkType: "preview", // or "direct"
            
                // Optional. A value of false (default) limits selection to a single file, while
                // true enables multiple file selection.
                multiselect: false, // or true
            
                // Optional. This is a list of file extensions. If specified, the user will
                // only be able to select files with these extensions. You may also specify
                // file types, such as "video" or "images" in the list. For more information,
                // see File types below. By default, all extensions are allowed.
                extensions: ['.jpg', '.mp3', '.wav','.mp4'],
            };
            //Dropbox.choose(options);
            openHtmlEditor();
            
        }); 
                     
        $( "#dialog-message" ).dialog({
            modal: true,
            height: 240,
            width: 360,
            position: ['center','middle'],
            buttons: {                
                Cancel: function(){                    
                    $( this ).dialog("close");
                    goBack()
                },   
                Next: function() {
                    var type = $('input[name=mediaType]:checked', '#selectMediaType').val();
                    //curMedia = new Media((new Date()).getTime(),"",type,"","",0,"","",curMediaType);
                    curMediaBank = new SharcMediaDesigner((new Date()).getTime() + "", "", type, "", 0, designerInfo.id, "", ""); 
                    curMedia = new SharcMediaExperience(0, curMediaBank, curMediaType, 0, curProject.id, "", "", false, true, 0, 0);
                    curBrowsingType = type;
                    $( this ).dialog("close");
                    switch (type)
                    {
                        case "text":
                            showTextDialog(true, null);
                            break;
                        case "image":
                            showImageDialog();
                            break;
                        case "audio":
                            showAudioDialog();
                            break;
                        case "video":
                            showVideoDialog();
                            break;
                    } 
                }             
            }
        });
    });
}


//Go back to the "manage POIs/EOIs/Routes" dialog: from main UI - POI - EOI - Route 
function goBack()
{
    if(callFrom == POI_FORM)
    {
        showAllPOIs();
    }
    else if(callFrom == EOI_FORM)
    {
        showAllEOIs();
    }
    else if(callFrom == ROUTE_FORM)
    {
        manageAllRoutes();
    }
    else if(callFrom == VIEW_FORM)
    {
        /*
        if(curMediaType == "POI")
            viewAllMediaItems(curPOI);
        else if(curMediaType == "EOI")
            viewAllMediaItems(curEOI);
        else if(curMediaType == "ROUTE")
            viewAllMediaItems(curRoute);
        */
        if(curMediaType == "POI")
            resfulManager.getMediaForEntity("POI", curPOI.id);
        else if(curMediaType == "EOI")
            resfulManager.getMediaForEntity("EOI", curEOI.id);
        else if(curMediaType == "ROUTE")
            resfulManager.getMediaForEntity("ROUTE", curRoute.id);
    }
}

//Go back to the dialog which shows all media items of an entiry (POI/EOI/Route)
function goBackMain() 
{
    if(openFrom == POI_FORM)    
        showAllPOIs();
    else if(openFrom == EOI_FORM)
        showAllEOIs();
     else if(openFrom == ROUTE_FORM)
        manageAllRoutes();
}

//remove media from array
function removeMediaFromArray(delId)
{    
    for(var i=0; i < allMedia.length; i++){
        if(allMedia[i].id == delId){            
            allMedia.splice(i,1);
            break;
        }
    }
}

//Add a text media item
function showTextDialog(isCreating, curMedia)
{
    $('#dialog-media').html('');   
    if(isCreating)     
        $('#dialog-media').dialog({ title: "Add text media" });
    else
        $('#dialog-media').dialog({ title: "Edit text media" });
    var content = '<p><b>You can edit the media content like a Microsoft word document in the form below and click the "Save" button at the end of the dialog</b></p>'
                + '<input type="file" hidden="hidden" id="importHtmlFile" accept=".html, .htm"/>'
                + '<form method="post" action="dump.php">'
                + '<textarea rows="15" cols="20" name="content" id="txtcontent" > </textarea>' 
                + '</form>';        
    $('#dialog-media').append(content); 
    //HTML editor
    tinyMCE.remove();
     tinyMCE.init({
		selector: "textarea",
		plugins: [
			"advlist autolink lists link image charmap print preview anchor",
			"searchreplace visualblocks code fullscreen textcolor",
			"insertdatetime media table contextmenu paste"
		],
        menu: {			
			edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},						
			format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
			table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
			tools: {title: 'Tools', items: 'spellchecker code'}
		},
		//toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
		toolbar: "insertfile undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
		convert_urls: false
	});
    $('#importHtmlFile').change(function(){
    		var reader = new FileReader();  // Create a FileReader object         
        	reader.readAsText(this.files[0]);           // Read the file
        	reader.onload = function() 
        	{    
        		var htmlContent = reader.result;   // This is the file contents
        	    tinyMCE.activeEditor.setContent(htmlContent);
        	};    	            			
    	});
    if(isCreating)   
        tinyMCE.activeEditor.setContent("Please type your text here");
    else{
        $.get(curMedia.mediaDesigner.content, function(content) { 
			// if you have one tinyMCE box on the page:
			tinyMCE.activeEditor.setContent(content);
		});
    }  
    $( "#dialog-media" ).dialog({
            modal: true,
            height: 500,
            width: 720,
            position: ['center','middle'],
            buttons: {                
                Import: {
                    text: "Import an HTML file",
                    class: 'leftButtonImport',
                    click: function(){
                        $("#importHtmlFile").trigger("click");
                    }
                },
                Cancel: function(){                    
                    $( this ).dialog("close");
                    goBack()
                }, 
                Back: function(){                 
                    if(isCreating) 
                        selectMediaType();
                    else{
                        $( this ).dialog("close");
                        goBack();
                    }                    
                },  
                Save: function() {
                    curMediaData = tinyMCE.activeEditor.getContent();
                    if(isCreating)
                        uploadAndAddMedia();
                    else{
                        cloudManager.updateMedia(curMedia.mediaDesigner.fileId, curMediaData);
                        $("#dialog-media").dialog("close");
                        selectedPOIMarker.setMap(null);
                        //goBack();
                    }
                        
                }             
            }
        });
}

//Add a photo media item
function showImageDialog()
{
    $('#dialog-media').html('');        
    $('#dialog-media').dialog({ title: "Adding a photo"});
    var content = '<div class="formLabel"><input type="file" id="inputMedia" accept="image/*" class="formLabel"/></div>'
                + '<div class="mediaPlacehold" id="mediaContent"><img id="mediaPOI" class="imgBox" src="images/placeholder.png"/></div>'    
                + '<div class="formLabel">Caption (optional)</div><div><input type="text" id="mediaCaption" class="inputText"/></div>';
    if(curMediaType == "POI")            
        content += '<p><input type="checkbox" class="inputCheckbox" id="mainMedia" value="mainMedia"/> Use this photo as the thumbnail for the POI</p>';
    $('#dialog-media').append(content);
    $( "#dialog-media" ).dialog({
        modal: true,
        width: 350,
        height: 480,        
        buttons: [                
            {   text: "Cancel",                
                click: function() {
                    $( this ).dialog( "close" );
                    goBack();
                }
            },                                      
            {   text: "Back",                
                click: function() {
                    selectMediaType();
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Add",                
                click: function() {
                    uploadAndAddMedia();                                        
                }
            }                  
        ]      
    });
    $('#inputMedia').change(function(){
        var fr = new FileReader();
        fr.onload = function () 
        {
            document.getElementById("mediaPOI").src = fr.result;
        }
        fr.readAsDataURL(this.files[0]);
        var fname = $(this).val();
        fname = fname.substring(fname.lastIndexOf("\\")+1,fname.lastIndexOf("."));        
        $("#mediaCaption").val(fname); 
        //read data as byte to upload
        readMediaFileAsBinary(this.files[0]);        
    });
}

//Add an audio media item
function showAudioDialog()
{
    $('#dialog-media').html('');        
    $('#dialog-media').dialog({ title: "Adding an audio clip"});
    var content = '<div class="formLabel"><button class="googleLookAndFeel" type="button" id="btnShowRecorder">Record audio</button> or <input type="file" id="inputMedia" style="width:191px" accept="audio/*" class="formLabel"/></div>'
                + '<div class="mediaPlacehold" id="mediaContent"><audio id="mediaPOI" width="318" height="200" controls ><source src="" type="audio/mpeg">Your browser does not support the audio tag.</audio></div>'    
                + '<div class="formLabel">Caption (optional)</div><div><input type="text" id="mediaCaption" class="inputText"/></div>';
    $('#dialog-media').append(content);
    $( "#dialog-media" ).dialog({
        modal: true,
        width: 360,
        height: 450,        
        buttons: [                
            {   text: "Cancel",                
                click: function() {
                    $( this ).dialog( "close" );
                    document.getElementById("mediaPOI").src = "";
                    goBack();
                }
            },                                      
            {   text: "Back",
                click: function() {
                    selectMediaType();
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Add",
                click: function() {
                    uploadAndAddMedia();
                    document.getElementById("mediaPOI").src = "";                                       
                }
            }                  
        ]      
    });
    $('#inputMedia').change(function(){
        var fr = new FileReader();
        fr.onload = function () 
        {
            document.getElementById("mediaPOI").src = fr.result;
        }
        fr.readAsDataURL(this.files[0]);
        var fname = $(this).val();
        fname = fname.substring(fname.lastIndexOf("\\")+1,fname.lastIndexOf("."));        
        $("#mediaCaption").val(fname); 
        //read data as byte to upload
        readMediaFileAsBinary(this.files[0]);        
    });
    $('#btnShowRecorder').click(function(){
        showRecordingDialog();     
	});
}

//not in use now as recording feature is not support by all browser
function showRecordingDialog()
{
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Recording an audio clip"});
    var content = '<p style="color:maroon;font-style:italic">It is suggested that you should use an audio recorder application on your machine to record an audio clip. For example:</p>'
                + '<ul>'
                + '<li>On Windows: Sound Recorder</li>'
                + '<li>On Mac: QuickTime Player</li>'
                + '<li>On Linux: GNOME Sound Recorder</li>'
                + '</ul>';
    $('#dialog-message').append(content);
    $( "#dialog-message" ).dialog({
        modal: true,
        width: 450,
        height: 325,        
        buttons: {
            OK: function() {                
                $( this ).dialog("close");
            }             
        }
    });
}

//not in use now 
function showRecordingDialogWithMic()
{
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Recording an audio clip"});
    var content = '<div align="center" id="viz">'
                + '<p style="color:maroon;">Please click the "Allow" button below the address bar of the web browser then click Record to start your recording</p>'
                + '<canvas class="recordingCanvas" id="analyser" width="630" height="120"></canvas>'
		        + '<canvas class="recordingCanvas" id="wavedisplay" width="630" height="120"></canvas>'
                + '<div id="recordingRes"><audio id="audioPreview" controls ><source src="" type="audio/mpeg"></audio> <a style="padding-left:27px;color:blue;" id="downloadAudio" href="#">Click here to download this record</a></div>'
	            + '</div>'
    $('#dialog-message').append(content);   
    initAudio();            
    $( "#dialog-message" ).dialog({
        modal: true,
        width: 680,
        height: 510,
        position: ['center','middle'],
        buttons: {             
            Cancel: function() {
                audioByRecording = false;
                $( this ).dialog("close");
                document.getElementById("mediaPOI").src = "";
                document.getElementById("audioPreview").src = "";
                $('#dialog-message').html('');    
            },
            Record: function() {                
                startRecording();
                $(".ui-dialog-buttonpane button:contains('Record')").button("disable");
                $(".ui-dialog-buttonpane button:contains('Stop')").button("enable");   
                $(".ui-dialog-buttonpane button:contains('Associate this record')").button("disable");
                $("#recordingRes").hide();             
            },
            Stop: function() {               
                $(".ui-dialog-buttonpane button:contains('Record')").button("enable");
                $(".ui-dialog-buttonpane button:contains('Associate this record')").button("enable");
                $(".ui-dialog-buttonpane button:contains('Stop')").button("disable");
                $("#recordingRes").show();
                stopRecording();
            },
            "Associate this record with the POI": function() {                
                $( this ).dialog("close");                
                document.getElementById("audioPreview").src = "";
            }             
        }
    });
    //$(".ui-dialog-buttonpane button:contains('Stop')").button(this.checked ? "enable" : "disable");
    $("#recordingRes").hide();
    $(".ui-dialog-buttonpane button:contains('Stop')").button("disable");
    $(".ui-dialog-buttonpane button:contains('Associate this record')").button("disable");
}

//Add a video media item
function showVideoDialog()
{
    $('#dialog-media').html('');        
    $('#dialog-media').dialog({ title: "Adding a video clip"});
    var content = '<div class="formLabel"><input type="file" id="inputMedia" accept="video/*" class="formLabel"/></div>'
                + '<div class="mediaPlacehold" id="mediaContent"><video id="mediaPOI" width="318" height="200" controls> <source src="">Your browser does not support the video tag.</video></div>'    
                + '<div class="formLabel">Caption (optional)</div><div><input type="text" id="mediaCaption" class="inputText"/></div>';
    $('#dialog-media').append(content);
    $( "#dialog-media" ).dialog({
        modal: true,
        width: 350,
        height: 450,        
        buttons: [                
            {   text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                    document.getElementById("mediaPOI").src = "";
                    goBack();
                }
            },                                      
            {   text: "Back",
                click: function() {
                    selectMediaType();
                    $( this ).dialog( "close" );
                    document.getElementById("mediaPOI").src = "";
                }
            },
            {
                text: "Add",
                click: function() {
                    uploadAndAddMedia();  
                    document.getElementById("mediaPOI").src = "";                                      
                }
            }                  
        ]      
    });
    $('#inputMedia').change(function(){
        var fr = new FileReader();
        fr.onload = function () 
        {
            document.getElementById("mediaPOI").src = fr.result;
        }
        fr.readAsDataURL(this.files[0]);
        var fname = $(this).val();
        fname = fname.substring(fname.lastIndexOf("\\")+1,fname.lastIndexOf("."));        
        $("#mediaCaption").val(fname); 
        //read data as byte to upload
        readMediaFileAsBinary(this.files[0]);        
    });  
}


//upload media file to Dropbox and add info about the media to the Media table in datastore in Dropbox
function uploadAndAddMedia()
{   
    var name = "";    
    if(curMediaBank.contentType != "text"){
        name = $.trim($('#mediaCaption').val());
    
        if(name!= "" && !isValidName(name)) {
            showMessage("Invalid name! Name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
            return;
        }
    }
    curMediaBank.name = name;         
    curMedia.caption = name;
    
    if(curMediaType == "POI")
        curMedia.entityId = curPOI.id;
    else if(curMediaType == "EOI")
        curMedia.entityId = curEOI.id;
    else if(curMediaType == "ROUTE")
        curMedia.entityId = curRoute.id;
               
    if(curMediaBank.contentType == "text")
    {
        cloudManager.uploadMedia(curMediaBank.id + ".html", curMediaData);
    }
    else if(curMediaBank.contentType == "audio")    
    {
        var fileName = $("#inputMedia").val();
        if(fileName == "" && audioByRecording == false)
        {
            showMessage("Please select a media file or record a new one!");
            return;
        }
        if (fileName == "") //recording
            fileName = "recorded.wav";
        //Get extension only
        fileName = fileName.substring(fileName.lastIndexOf("."));
        cloudManager.uploadMedia(curMediaBank.id + fileName, curMediaData);
        audioByRecording =false;
    }
    else if(curMediaBank.contentType == "image")
    {
        var fileName = $("#inputMedia").val();        
        if(fileName == "")
        {
            showMessage("Please select a media file!");
            return;
        }        
        curMedia.mainMedia = $('#mainMedia').is(':checked');                
        //always saved as a jpg image
        cloudManager.uploadMedia(curMediaBank.id + ".jpg", curMediaData);
    }
    else if(curMediaBank.contentType == "video")
    {
        var fileName = $("#inputMedia").val();
        if(fileName == "")
        {
            showMessage("Please select a media file!");
            return;
        }
        //Get extension only
        fileName = fileName.substring(fileName.lastIndexOf("."));        
        cloudManager.uploadMedia(curMediaBank.id + fileName, curMediaData);
    }    
    
    showUploadingStatus("Please wait! Uploading media...");
    $("#dialog-media").dialog("close");
}

function presentNewMedia(data, count)//count = 1 / -1 when add/delete a media item
{
    //allMedia.push(curMedia);   
        
    if(curMediaType == "POI")
    {
        curPOI.mediaCount += count;
        if(data.mainMedia == 1 && count >=0){//update or add 
            var icon = getImageMarker(data.mediaDesigner.content);
            setPoiThumbnail(curPOI, icon);
        }
        selectedPOIMarker.setMap(null);            
    }
    else if(curMediaType == "EOI")
    {
        curEOI.mediaCount += count;
    }
    else if(curMediaType == "ROUTE")
    {
        curRoute.mediaCount += count;
    }
    goBack();     
    if(count == 1)//adding -> remove the waiting
        $("#dialog-status").dialog("close");
}
//Edit a media item
function viewEditMediaItem(curMedia)
{        
    if(curMedia.mediaDesigner.contentType == "text"){
        showTextDialog(false, curMedia);
        return;
    }
        
    $('#dialog-media').html('');        
    $('#dialog-media').dialog({ title: "Edit a media item"});
    
    var content = "";
    if(curMedia.mediaDesigner.contentType == "image")
        content = '<div class="mediaPlacehold"><img class="imgBox" src="' + curMedia.mediaDesigner.content + '"/></div>' + content;
    else if(curMedia.mediaDesigner.contentType == "audio")
        content = '<div class="mediaPlacehold"><audio width="318" height="200" controls ><source src="' + curMedia.mediaDesigner.content + '" type="audio/mpeg"></audio></div>' + content;
    else if(curMedia.mediaDesigner.contentType == "video")
        content = '<div class="mediaPlacehold"><video width="318" height="200" controls> <source src="' + curMedia.mediaDesigner.content + '"></video></div>' + content;
    
    content = content + '<div class="formLabel">Name</div><div><input type="text" id="mediaCaption" class="inputText" value="' + curMedia.caption + '" /></div>';
    
    if(curMediaType == "POI" && curMedia.mediaDesigner.contentType == "image"){            
        if(curMedia.mainMedia)
        	content += '<p><input type="checkbox" checked class="inputCheckbox" id="mainMedia" value="mainMedia"/> Use this photo as the thumbnail for the POI</p>';
        else
        	content += '<p><input type="checkbox" class="inputCheckbox" id="mainMedia" value="mainMedia"/> Use this photo as the thumbnail for the POI</p>';
    }
                
      
    $('#dialog-media').append(content);
    
    $("#dialog-media").dialog({
        modal: true,
        width: 360,
        height: 415,        
        buttons: [                
            {   text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                    goBack();
                }
            },
            {
                text: "Save",
                click: function() {
                    var name = $.trim($('#mediaCaption').val());
                    var desc = "";
                    if(!isValidName(name))
                    {
                        showMessage("Invalid name! Name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
                        return;
                    }
                    
                    curMedia.mainMedia = $('#mainMedia').is(':checked');//should check POI and image but ok
                    curMedia.caption = name;                    
                    resfulManager.updateMedia(curMedia);
                    $( this ).dialog( "close" );                    
                    //goBack();                                      
                }
            }                  
        ]      
    });    
}

//swap the order of two media items
function swapMediaItem(curPOI,first,second)
{
    var tmp = curPOI.mediaOrder[first];
    curPOI.mediaOrder[first] = curPOI.mediaOrder[second];
    curPOI.mediaOrder[second] = tmp;
}

function updateMediaOrder(){
    var mediaList = $('#uList li');
    var mediaOrder = "";
    for(var i = 0; i < mediaList.length; i++)
        mediaOrder += " " + $(mediaList[i]).attr('id');
    mediaOrder = mediaOrder.substr(1);
    
    if(curMediaType == "POI")
        resfulManager.updateMediaOrderForEntity("POI", curPOI.id, mediaOrder);
    else if(curMediaType == "EOI")
        resfulManager.updateMediaOrderForEntity("EOI", curEOI.id, mediaOrder);
    else if(curMediaType == "ROUTE")
        resfulManager.updateMediaOrderForEntity("ROUTE", curRoute.id, mediaOrder);
}


//Scroll media item up in the media pane
function scrollUp(step)
{
    var cur = $('#dialog-message').scrollTop();        
    cur = parseInt(cur)- step;
    if(cur<0)
        cur = 0;         
    $('#dialog-message').stop().animate({
        scrollTop:cur
    },500);    
}

//Scroll media item down in the media pane
function scrollDown(step)
{    
    var cur = $('#dialog-message').scrollTop();
    cur = parseInt(cur)+ step;
    $('#dialog-message').stop().animate({
        scrollTop:cur
    },500);
    
}
   
function getCurrentEntityName()
{
    if(curMediaType == "POI")
        return curPOI.poiDesigner.name;
    else if(curMediaType == "EOI")
        return curEOI.eoiDesigner.name;
    else if(curMediaType == "ROUTE")
        return curRoute.routeDesigner.name;
}
//Display a list of media items associated to an entity (POI-EOI-Route)
function viewAllMediaItems(data)
{
    $('#dialog-message').html('');        
    //Title shows name of the entity and the number of media 
    var entityName = getCurrentEntityName();
    var count = data.length;
    $('#dialog-message').dialog({ title: entityName + " (No. of media: " + count + ")"});
    //Show all media items in an unordered list
    var content = getMediaContentWithOptions(data);// + getResponseContent(tmpObject);
    $('#dialog-message').append(content);
    
        
    var buttonList = $("#uList").find("button");
    //Disable the Up button of the first item 
    $(buttonList[0]).prop('disabled', true);
    //Disable the Down button of the last item
    $(buttonList[buttonList.length - 3]).prop('disabled', true);     
    
    //Move a media item up
    $(".reorder-up").click(function(){
        var $current = $(this).closest('li');
        var selectedID = $current.index();
        var $previous = $current.prev('li');
        if($previous.length !== 0){
            isChangingMediaOrder = true;
            
            //Enable all action buttons
            $($current.find("button")[0]).prop('disabled', false);                
            $($current.find("button")[1]).prop('disabled', false);
            $($previous.find("button")[0]).prop('disabled', false);
            $($previous.find("button")[1]).prop('disabled', false);
            //If the current item is the second item -> move up -> become the first item -> Disable Up button
            if(selectedID == 1)
            {
                $($current.find("button")[0]).prop('disabled', true);                    
            }    
            //If the current item is the last item --> the item above it will become the last item -> disable Down button of this above item
            if(selectedID == count - 1)
            {
                $($previous.find("button")[1]).prop('disabled', true);                    
            }
                
            $current.insertBefore($previous);
            scrollUp($previous.outerHeight());
            //swapMediaItem(tmpObject,selectedID,selectedID - 1);
        }
        return false;
    });
    
    //Move a media item down    
    $(".reorder-down").click(function(){
        var $current = $(this).closest('li');
        var selectedID = $current.index();
        var $next = $current.next('li');
        if($next.length !== 0){
            isChangingMediaOrder = true;
            
            //Enable all button
            $($current.find("button")[0]).prop('disabled', false);                
            $($current.find("button")[1]).prop('disabled', false);
            $($next.find("button")[0]).prop('disabled', false);
            $($next.find("button")[1]).prop('disabled', false);
            //If the current item is the first item --> the item below it will become the first item -> Disable the Up button of this below item
            if(selectedID == 0)
            {
                $($next.find("button")[0]).prop('disabled', true);                    
            }
            //If the current item is before the last item --> the current item will become the last item-> Disable the Down button of the current item    
            if(selectedID == count - 2)
            {
                $($current.find("button")[1]).prop('disabled', true);                    
            }
                
            $current.insertAfter($next);
            scrollDown($next.outerHeight());
            //update media order
            //swapMediaItem(tmpObject,selectedID,selectedID + 1);
        }
        return false;
    });
    
    
    //Delete a media item
    $(".reorder-delete").click(function(){
        var $current = $(this).closest('li');
        var selectedID = $current.index();
        var selectedMediaId = $current.attr("id");
        $('#dialog-media').html('');        
        $('#dialog-media').dialog({ title: "Deleting a media item"});        
        $('#dialog-media').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This media item will be permanently deleted and cannot be recovered. Are you sure?</p>');               
        $( "#dialog-media" ).dialog({
            modal: true,            
            height: 225,
            width: 460,            
            buttons: {             
                Cancel: function() {
                    $( this ).dialog("close");
                },
                Yes: function() {
                    resfulManager.deleteMedia(selectedMediaId);
                    //If the current item is the first item -> The item below it will become the first item -> Disable its Up button 
                    if(selectedID == 0)
                    {
                        var $next = $current.next('li');   
                        if($next.length !== 0)                    
                            $($next.find("button")[0]).prop('disabled', true);                    
                    }
                    //If the current item is the last item -> The item above it will become the last item -> Disable its Down button
                    if(selectedID == count - 1)
                    {
                        var $previous = $current.prev('li');
                        if($previous.length !== 0)               
                           $($previous.find("button")[1]).prop('disabled', true);              
                    }
                       
                    $current.remove();
                    $('#dialog-message').dialog({ title: entityName + " (No. of media: " + (--count) + ")"});
                    $( this ).dialog("close");
                }             
            }
        });                     
        return false;
    });
    
    //Edit a media item
    $(".reorder-edit").click(function(){
        var $current = $(this).closest('li')
        //var selectedID = $current.index();
        resfulManager.getMedia($current.attr("id"));
        callFrom = VIEW_FORM;           
        $("#dialog-message").dialog("close");         
        return false;
    });
    
    //for link in media
    $("p a").click(function(){
        alert("not supported yet");
        event.stopPropagation();             
        return false;
    });
    
                          
    if(curMediaType == "POI")
    {
        $( "#dialog-message" ).dialog({
            modal: true,
            width: 600,
            height: 480,
            position: ['center','middle'],
            buttons: {             
                Add: {                
                    text:"Add a new media item",
                    click: function() {
                        //$( this ).dialog("close");
                        callFrom = VIEW_FORM;                
                        //selectMediaType();
                        selectMediaSource();
                    }                
                }, 
                Edit: {
                    class: 'leftButtonAddMedia',
                    text:"Edit POI's info and trigger zone",
                    click: function() {
                        //$( this ).dialog("close");
                        callFrom = VIEW_FORM;
                        if(curMediaType == "POI")
                        {
                            trigerZonePOI = allPOIZones[selectedPoiIndex];
                            createPOI(false,false,selectedPoiIndex);
                        }
                    }                
                },             
                Close: function() {
                    if(isChangingMediaOrder)
                    {
                        updateMediaOrder();
                        isChangingMediaOrder = false; 
                    }
                    $( this ).dialog("close");
                    goBackMain();
                    selectedPOIMarker.setMap(null);
                }
            }
        });        
    }
    else
    {
        $( "#dialog-message" ).dialog({
            modal: true,
            width: 600,
            height: 480,
            position: ['center','middle'],
            buttons: {             
                Add: {                
                    text:"Add a new media item",
                    click: function() {
                        //$( this ).dialog("close");
                        callFrom = VIEW_FORM;                
                        selectMediaType();
                    }                
                },             
                Close: function() {
                    if(isChangingMediaOrder)
                    {
                        updateMediaOrder();
                        isChangingMediaOrder = false; 
                    }
                    $( this ).dialog("close");
                    goBackMain();
                }
            }
        });
    }
    
}

//Present each media item as an element in an unordered list. 
//Each media item consists of:  
//      - Content of the media item (text/image/audio/video)
//      - Caption (or title/description) which is placed above the content for text media and below the content for other media
//      - availble actions: Move Up - Move Down - Edit - Delete 

function getMediaContentWithOptions(mediaExperience)//For displaying media pane
{
    var content = '<ul id="uList" style="list-style:none; padding-left:0;display:table; margin:0 auto;">';
    var tmpMedia;
    for(var i=0; i < mediaExperience.length; i++)
    {
        tmpMedia = mediaExperience[i].mediaDesigner;
        
        if(tmpMedia.contentType == "text")
            content += '<li id="' + mediaExperience[i].id + '"><div><object class="textMediaBox" id="mediaPOI" type="text/html" data="' + tmpMedia.content + '" ></object></div>';
        else if(tmpMedia.contentType == "image")
            content += '<li id="' + mediaExperience[i].id + '"><img class="imgMedia" width="318" src="' + tmpMedia.content + '"/>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';        
        else if(tmpMedia.contentType == "audio")
            content += '<li id="' + mediaExperience[i].id + '"><div class="mediaPlacehold"><audio width="318" height="50" controls ><source src="' + tmpMedia.content + '" type="audio/mpeg"></audio></div>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';
        else if(tmpMedia.contentType == "video")
            content += '<li id="' + mediaExperience[i].id + '"><div class="mediaPlacehold"><video width="318" height="200" controls> <source src="' + tmpMedia.content + '"></video></div>' + '<div class="formLabel">' + mediaExperience[i].caption + '</div>';
        //content += '<div class="formLabel">' + tmpMedia.name + '</div><div style="text-align:center"><a href="#" class="reorder-up"><img  title="Move this media item up" class="actionImage" src="images/media_up.png"/></a><a href="#" class="reorder-down"><img class="actionImage" src="images/media_down.png" title="Move this media item down"/></a><a href="#" class="reorder-edit"><img class="actionImage" src="images/edit.png" title="Edit this media item"/></a><a href="#" class="reorder-delete"><img class="actionImage" src="images/delete.png" title="Delete this media item up"/></a></div><hr/>';
        //content += '<div style="text-align:center">' + tmpMedia.noOfLike + (tmpMedia.noOfLike > 1 ? ' Likes': ' Like') + '[ and xx Comments] <button class="googleLookAndFeel"><img class="actionImage" src="images/media_up.png"/>[View comments]</button></div><hr style="width:50%"/>';
        content += '<div style="text-align:center"><button class="reorder-up googleLookAndFeel"><img class="actionImage" src="images/media_up.png"/>Up</button><button class="reorder-down googleLookAndFeel"><img class="actionImage" src="images/media_down.png"/>Down</button><button class="reorder-edit googleLookAndFeel"><img class="actionImage" src="images/edit.png"/>Edit</button><button class="reorder-delete googleLookAndFeel"><img class="actionImage" src="images/delete.png" title="Delete this media item up"/>Delete</button></div><hr/>';
    }   
    return content + '</ul>';
}

//Get responses for the entity to add at the end of the media pane - NOT IN USE NOW
function getResponseContent(tmpPOI)//For displaying media pane
{
    var content = '<ul style="list-style:none; padding-left:0;display:table; margin:0 auto;">';
    for(key in tmpPOI.associatedResponses)
    {
    	var res = tmpPOI.associatedResponses[key];
    	var responseText = "<div style='background-color:#66CCFF;'><p style='text-align:center;font-weight:bold;'> A response added by " + res.conName + " at " + new Date(parseFloat(allResponses[0].id)) + "</p>";
    	//responseText += "<p style='text-align:left;margin-left:10'>" + res.desc + "</p>";
    	var i =1000;
    	if(res.type == "text")
    		responseText += '<li id="' + i + '"><div class="formLabel">' + res.content + '</div><div>' + res.desc +'</div>';
        else if(res.type == "image")
        	responseText += '<li id="' + i + '"><img hspace="5" class="imgMedia" width="95%" src="' + res.content + '"/>' + '<div class="formLabel">' + res.desc + '</div>';        
        else if(res.type == "audio")
        	responseText += '<li id="' + i + '"><div class="mediaPlacehold"><audio width="318" height="50" controls ><source src="' + res.content + '" type="audio/mpeg"></audio></div>' + '<div class="formLabel">' + res.desc + '</div>';
        else if(res.type == "video")
            content += '<li id="' + i + '"><div class="mediaPlacehold"><video width="318" height="200" controls> <source src="' + res.content + '"></video></div>' + '<div class="formLabel">' + res.desc + '</div>';
        //content += '<div class="formLabel">' + tmpMedia.name + '</div><div style="text-align:center"><a href="#" class="reorder-up"><img  title="Move this media item up" class="actionImage" src="images/media_up.png"/></a><a href="#" class="reorder-down"><img class="actionImage" src="images/media_down.png" title="Move this media item down"/></a><a href="#" class="reorder-edit"><img class="actionImage" src="images/edit.png" title="Edit this media item"/></a><a href="#" class="reorder-delete"><img class="actionImage" src="images/delete.png" title="Delete this media item up"/></a></div><hr/>';
    	//responseText += '<div style="text-align:center">' + tmpMedia.noOfLike + (tmpMedia.noOfLike > 1 ? ' Likes': ' Like') + '[ and xx Comments] <button class="googleLookAndFeel"><img class="actionImage" src="images/media_up.png"/>[View comments]</button></div><hr style="width:50%"/>';
    	content += responseText;
    }   
    return content + '</ul>';
}

//Get media items for exporting/generating KML file
function getPOIMediaContent(tmpPOI)

{
    var content = "";
    var tmpMedia;
    for(var i=0; i < tmpPOI.media.length; i++)
    {
        tmpMedia = tmpPOI.media[i];
        if(tmpMedia.mediaDesigner.contentType == "text")
            content += '<div><object class="textMediaBox" id="mediaPOI" type="text/html" data="' + tmpMedia.mediaDesigner.content + '" ></object></div>';
        else if(tmpMedia.mediaDesigner.contentType  == "image")
            content += '<div style="text-align:center;"><img width="350" src="' + tmpMedia.mediaDesigner.content + '"/></div>';        
        else if(tmpMedia.mediaDesigner.contentType  == "audio")
            content += '<div style="text-align:center;"><audio width="350" controls ><source src="' + tmpMedia.mediaDesigner.content + '" type="audio/mpeg"></audio></div>' ;
        else if(tmpMedia.mediaDesigner.contentType  == "video")
            content += '<div style="text-align:center;"><video width="350" controls> <source src="' + tmpMedia.mediaDesigner.content + '"></video></div>';
        content += '<div style="text-align:center;font-weight:bold;">' + tmpMedia.caption + '</div><hr/>';
    }
    return content;
}