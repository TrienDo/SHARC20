/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Implementing menu POI Type functions   
*/ 
function createNewPOIType(isCreating)
{
    $(function() {        
        $('#dialog-message').html(''); 
        if(isCreating)       
            $('#dialog-message').dialog({ title: "Create a new type of POI" });
        else
            $('#dialog-message').dialog({ title: "Edit a type of POI" });
        var content = '<div class="formLabel">Type of POI</div><div><input type="text" id="poiTypeName" class="inputText"/></div>'
                  //  + '<div><button type="button" id="selectIcon" class="browseIcon">Choose icon for this type of POI</button>'
                  //  + '<input hidden="hidden" type="file" id="inputIcon" name="inputIcon" accept="image/*"/> '
                  //  + '<img class="iconPlacehold" id="imageIcon" src=""/></div>'
                    + '<div class="formLabel">Description (optional)</div><div><textarea rows="3" id="poiTypeDesc" class="inputText"></textarea></div>';
        $('#dialog-message').append(content); 
        
        /*$('#selectIcon').click(function() {
    		$("#inputIcon").trigger("click");
    	});
    	
        //Chose file button
        $('#inputIcon').change(function(){
            var fr = new FileReader();
            fr.onload = function () 
            {
                document.getElementById("imageIcon").src = fr.result;
            }
            fr.readAsDataURL(this.files[0]);            
            readMediaFileAsBinary(this.files[0]);           			
    	});*/  		
    
        if(!isCreating)
        {
            $("#poiTypeName").val(curPOIType.name);
            $("#poiTypeDesc").val(curPOIType.desc);
            //$("#inputIcon").val(curPOIType.icon);
            //$("#imageIcon").val(curPOIType.icon);                       
        }      
        $( "#dialog-message" ).dialog({
            modal: true,
            height: 270,
            width: 350,
            position: ['center','middle'],
            buttons: {
                Cancel: function() {
                    $(this).dialog("close");
                    if(!isCreating)
                    {                        
                        showAllPOITypes();
                    }
                },
                Save: function() {                   
                    //var fname = $("#inputIcon").val();
                    //fname = fname.substring(fname.lastIndexOf("\\")+1,fname.lastIndexOf("."));
                    var name = $.trim($("#poiTypeName").val());
                    var desc = $.trim($("#poiTypeDesc").val());
                    if(!isValidName(name))
                    {
                        showMessage("Invalid EOI Type name! Name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
                        return;
                    }
                    if(desc!="" && !isValidDescription(desc))
                    {
                        showMessage("Invalid EOI Type description! Description should contain only numbers, characters, hyphen, underscore, comma, period, colon, and space.");
                        return;
                    }
                    if(!isCreating)
                    {
                        curPOIType.name = name;
                        curPOIType.desc = desc; 
                        mDropBox.updatePOIType(curPOIType);                                                                        
                    }
                    else
                    {
                        curPOIType = new POIType((new Date()).getTime(),$("#poiTypeName").val(),"",$("#poiTypeDesc").val());
                        allPOITypes.push(curPOIType);
                        mDropBox.insertPOIType(curPOIType);                                                
                    }
                    $(this).dialog("close");
                    showAllPOITypes();                    
                }             
            }
        });
    });
} 

function showAllPOITypes()
{
    $(function() {        
        presentPOITypes();
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allPOITypes.length),
            width: 700,
            position: ['center','middle'],
            buttons: {
                "Add a new type of POI": function() {
                    $(this).dialog("close");
                    createNewPOIType(true);                    
                }, 
                Close: {
                    class: 'rightButtonClosePOIType',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }              
            }
        });
    });
}

function presentPOITypes()
{
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Manage types of POI" });
    $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Name</th><th>Description</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
    for(var i=0; i < allPOITypes.length; i++)
    {
        $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + allPOITypes[i].name  + '</td><td>' + allPOITypes[i].desc+ '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/edit.png"> Edit this POI type</button><button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Delete this POI type</button></td></tr>');
    } 
    $("#tblData").addClass("tableBorder");
    $("#tblData td").addClass("tableBorder");
    $("#tblData th").addClass("tableHeader");
    $(".btnEdit").bind("click", editPOIType);	
    $(".btnDelete").bind("click", deletePOIType);
}
function editPOIType()
{ 
    var par = $(this).parent().parent(); //tr 
    var tdName = par.children("td:nth-child(1)"); 
    curPOIType = allPOITypes[parseInt(tdName.text()-1)];    
    createNewPOIType(false);    
}

function deletePOIType()
{ 
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    curPOIType = allPOITypes[tdIndex];    
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Delete a type of POI"});        
    $('#dialog-message').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This type of POI will be permanently deleted and cannot be recovered. Are you sure?</p>');               
    $( "#dialog-message" ).dialog({
        modal: true,            
        height: 225,
        width: 460,            
        buttons: {             
            Cancel: function() {
                $( this ).dialog("close");
                showAllPOITypes();
            },
            Yes: function() {                
                $( this ).dialog("close");                    
                mDropBox.deletePOIType(curPOIType);
                allPOITypes.splice(tdIndex,1); 
                showAllPOITypes();
            }             
        }
    });
}