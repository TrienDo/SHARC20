/*
    Author:     Trien Do
    Tasks:      Implementing menu functions of menu My Library   
*/

   
function Library_showMediaLibrary()
{
	resfulManager.getMediaLibrary(designerInfo.id);
}

function presentAllMedia(media)
{
    
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Media Library" });
    $('#dialog-message').append('Some filter options here<table width="100%" id="tblData"><thead><tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody></tbody></table>');
    var contentString = "";        
    for(var i=0; i < media.length; i++)
    {   
        if((i+1)%5 == 1)
            contentString += "<tr>";
        var mediaString = "";     
        if(media[i].contentType == "text")
            mediaString = '<object class="textMediaBox" style="width:150px;height:120px " id="mediaPOI" type="text/html" data="' + media[i].content + '" ></object>';
        else if(media[i].contentType == "image")
            mediaString = '<img style="width:150px" src="' + media[i].content + '">';
        else if(media[i].contentType == "audio")
            mediaString = '<audio style="width:150px" controls ><source src="' + media[i].content + '" type="audio/mpeg"></audio>';
        else if(media[i].contentType == "video")
            mediaString = '<video style="width:150px" controls> <source src="' + media[i].content + '"></video>';
        
        mediaString = '<td style="text-align:center;"><div>' + mediaString + '</div><div>' + media[i].name + '</div></td>';
        contentString += mediaString;
        if((i+1)%5 == 0)
            contentString += "</tr>";
    } 
    $("#tblData tbody").append(contentString);
    $("#tblData").addClass("tableBorder");
    $("#tblData td").addClass("tableBorder");
    $("#tblData th").addClass("tableHeader");
    //$(".btnAdd").bind("click", approveResponse);
    $( "#dialog-message").dialog({
            modal: true,
            height: 600,
            width: 930,
            position: ['center','middle'],
            buttons: {                
                Cancel: function() {                    
                    $(this).dialog("close"); 
                }, 
                Add: {
                    //class: 'rightButtonCloseEOI',
                    text:"Add",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }                
            }
        });
}

function Library_showPoiLibrary(){
    
}

function Library_showEoiLibrary(){
    
}

function Library_showRouteLibrary(){
    
}

function Library_showPoiTypeLibrary(){
    
}