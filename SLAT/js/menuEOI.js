/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Implementing menu EOI functions   
*/ 

//This function enables creating/editing EOI
//Input:    isCreating = 1 for creating a new EOI, = 0 for editing         
//User Interface: based on input params + database, corresponding UIs are dynamically generated. 
function createNewEOI(isCreating) {        
    $(function() {        
        //Generate UI
        $('#dialog-message').html(''); 
        if(isCreating)       
            $('#dialog-message').dialog({ title: "Create a new EOI" });
        else
            $('#dialog-message').dialog({ title: "Edit an EOI" });
        //var content = '<div class="formLabel">Event name</div><div><input type="text" id="eoiName" class="inputText"/></div>'
        //            + '<div><table><tbody><tr><td class="formLabel">Start date (optional)</td><td><input type="date" id="startDate" style="width:180px;"></td></tr>'
        //            + '<tr><td class="formLabel">End date (optional)</td><td><input type="date" id="endDate" style="width:180px;"></td></tr></tbody></table>'
        //            + '<div class="formLabel">Event details (optional)</div><div><textarea rows="3" id="eoiDesc" class="inputText"/></div>'
        //            + '<div>' + getPOIAndRoute() + '</div>';
        var content = '<div class="formLabel">Event name</div><div><input type="text" id="eoiName" class="inputText"/></div>'
            //+ '<div><table><tbody><tr><td class="formLabel"></td><td><input type="date" id="startDate" style="width:180px;"></td></tr>'
            //+ '<tr><td class="formLabel"></td><td><input type="date" id="endDate" style="width:180px;"></td></tr></tbody></table>'
            //+ '<div class="formLabel"></div><div><textarea rows="3" id="eoiDesc" class="inputText"/></div>'
            + '<div>' + getPOIAndRoute() + '</div>';
        
        $('#dialog-message').append(content); 
        
        if(!isCreating)//Editing -> fill information of the EOI to the dialog
        {
            $("#eoiName").val(curEOI.eoiDesigner.name);
            $("#eoiDesc").val(curEOI.eoiDesigner.description);
            //$("#startDate").val(curEOI.startDate);
            //$("#endDate").val(curEOI.endDate);  
            var selectedPOIs = curEOI.poiList.split(" ");
            for(var i=0; i<selectedPOIs.length; i++)
                $('#relPoi input[value="' + selectedPOIs[i] + '"]').prop('checked', true);
            var selectedRoutes = curEOI.routeList.split(" ");
            for(var i=0; i<selectedRoutes.length; i++)
                $('#relRoute input[value="' + selectedRoutes[i] + '"]').prop('checked', true);          
        }   
        
        $("#eoiDesc").hide();
        $("#startDate").hide();
        $("#endDate").hide();
        
        //Calculate height for the dialog
        var maxEle = Math.max(allPOIs.length, allRoutes.length);        
        if(maxEle >=4)
            maxEle = 525;
        else if(maxEle >=3)
            maxEle = 510;
        else if(maxEle >=2)
            maxEle = 495;
        else if(maxEle >=1)
            maxEle = 480;
        else 
            maxEle = 465;
        maxEle -= 100;
               
        $( "#dialog-message" ).dialog({
            modal: true,
            height: maxEle - 110,
            width: 355,
            position: ['center','middle'],
            buttons: {
                Cancel: function() {
                    $(this).dialog("close");
                    if(!isCreating)
                    {                        
                        showAllEOIs();
                    }
                },
                Save: function() {     
                    var name = $.trim($("#eoiName").val());
                    var desc = $.trim($("#eoiDesc").val());
                    var startDate = new Date($("#startDate").val());
                    var endDate = new Date($("#endDate").val());
                    var dataChanges = new Array();
                    var newRow = "";
                    if(!isValidName(name))
                    {
                        showMessage("Invalid EOI name! EOI name cannot be blank and should contain only numbers, characters, hyphen, underscore, period, and space.");
                        return;
                    }
                    if(desc!="" && !isValidDescription(desc))
                    {
                        showMessage("Invalid EOI description! EOI description should contain only numbers, characters, hyphen, underscore, comma, period, colon, and space.");
                        return;
                    }
                    /*if(startDate == "Invalid Date")
                    {
                        showMessage("Invalid start date");
                        return;
                    }
                    if(endDate == "Invalid Date")
                    {
                        showMessage("Invalid end date");
                        return;
                    }
                    if(startDate != "Invalid Date" && endDate == "Invalid Date" && startDate > endDate)
                    {
                        showMessage("Start date cannot be after end date.");
                        return;
                    }*/
                    
                    startDate = $("#startDate").val();//startDate.toLocaleDateString();
                    endDate = $("#endDate").val();//endDate.toLocaleDateString();
                    //Get associated POIs
                    var selectedPOIs = [];
                    $('#relPoi input:checked').each(function() {
                        selectedPOIs.push($(this).val());
                    });                    
                    //Get associated routes
                    var selectedRoutes = [];
                    $('#relRoute input:checked').each(function() {
                        selectedRoutes.push($(this).val());
                    });
                    
                    
                    if(!isCreating)
                    {                        
                        curEOI.eoiDesigner.name = name;
                        curEOI.eoiDesigner.description = desc;
                        //curEOI.startDate = startDate;
                        //curEOI.endDate = endDate;
                        curEOI.poiList = selectedPOIs.join(" ");
                        curEOI.routeList = selectedRoutes.join(" ");
                        resfulManager.updateEoi(curEOI);                                                                       
                    }
                    else
                    {                        
                        var eoiBank = new SharcEoiDesigner(0, name, desc, designerInfo.id);                        
                        curEOI = new SharcEoiExperience(0, eoiBank, curProject.id, "", selectedPOIs.join(" "), selectedRoutes.join(" "),0,0);                        
                        allEOIs.push(curEOI);                             
                        $("#noOfEOI").text("Number of EOIs: " + allEOIs.length); 
                        resfulManager.createNewEoi(curEOI);                                                                  
                    }
                    $(this).dialog("close");
                    showAllEOIs();                    
                }             
            }
        });
    });
}

function presentNewEoi(data)
{
    curEOI.id = data.id;
}
function getPOIAndRoute()
{
     var content =  '<table border="0" width="308"  cellpadding="1" cellspacing="1">'                
                    +		'<tr>'
                    +			'<td width="154" class="formLabel">' + (allPOIs.length > 0? 'Associated POI(s)': 'Currently, there are no POIs to associate with') + '</td>'                    
                    +			'<td width="154" class="formLabel">' + (allRoutes.length > 0? 'Associated Route(s)': 'Currently, there are no routes to associate with') + '</td>'
                    +		'</tr>'                            
                    +		'<tr>'
                    +           '<td>'
                    +            '<div id="relPoi" style="max-height: 70px; overflow: auto;width:152px;">'
                    +                '<table border="0" cellpadding="1" cellspacing="1">';                        
    for(var i=0;i<allPOIs.length;i++)
        content += '<tr><td class="formText"><input type="checkbox" class="inputCheckbox" value="' + allPOIs[i].id + '"> ' + allPOIs[i].poiDesigner.name + '</td></tr>';
    content = content +          '</table>'                    
                    +            '</div>'
                    +           '</td>'
                    +            '<td>'
                    +                '<div id="relRoute" style="max-height: 70px; overflow: auto; width:152px;">'
                    +                    '<table border="0" cellpadding="1" cellspacing="1" >';    
    for(var i=0;i<allRoutes.length;i++)
        content += '<tr><td class="formText"><input type="checkbox" class="inputCheckbox" value="' + allRoutes[i].id + '"> ' + allRoutes[i].routeDesigner.name + '</td></tr>';
    content = content +              '</table>'                    
                    +               '</div>'
                    +           '</td>'                    
                    +       '</tr>'                    
                    +    '</table>'
    return content;             
}

function showAllEOIs() {        
    /*
     curEOI = new EOI("9","Flood","2014-10-16","2014-10-02","Horrible flood");
         allEOIs.push(curEOI);
         curEOI = new EOI("10","Scarecrow","2014-05-08","2014-05-09","Annual event");
         allEOIs.push(curEOI);
     */
    $(function() {        
        presentEOIs();
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allEOIs.length),
            width: 930,
            position: ['center','middle'],
            buttons: {                
                "Add a new EOI": function() {                    
                    $(this).dialog("close"); 
                    createNewEOI(true);                      
                }, 
                Close: {
                    class: 'rightButtonCloseEOI',
                    text:"Close",
                    click: function() {                
                        $(this).dialog("close");                    
                    }
                }                
            }
        });
    });
}

function presentEOIs()
{
    try
    {
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Manage EOIs" });
        //$('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Name</th><th>Event details</th><th>No. of associated POIs</th><th>No. of associated routes</th><th>No. of media</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No.</th><th class="tableNameColumn">Name</th><th>No. of linked POIs</th><th>No. of linked routes</th><th>No. of media</th><th class="tableNameColumn">Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < allEOIs.length; i++)
        {
            var name = allEOIs[i].eoiDesigner.name;
            var desc = allEOIs[i].eoiDesigner.description;
            allEOIs[i].poiList += "";//Make it a string
            var poiCount = (allEOIs[i].poiList == "" ? 0 : allEOIs[i].poiList.split(" ").length);
            allEOIs[i].routeList += "";//Make it a string
            var routeCount = (allEOIs[i].routeList == "" ? 0 : allEOIs[i].routeList.split(" ").length);
            var mediaCount = allEOIs[i].mediaCount;
            //var mediaCount = allEOIs[i].mediaOrder.length;
            //$("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + name + '</td><td>' + desc + '</td><td style="text-align:center;">' + poiCount + '</td><td style="text-align:center;">' + routeCount + '</td><td style="text-align:center;">' + mediaCount + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/edit.png"> Edit this EOI</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Delete this EOI</button> <button class="btnView googleLookAndFeel">Manage this EOI\'s media</button></td></tr>');
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + name + '</td><td style="text-align:center;">' + poiCount + '</td><td style="text-align:center;">' + routeCount + '</td><td style="text-align:center;">' + mediaCount + '</td><td><button class="btnEdit googleLookAndFeel"><img style="vertical-align:middle" src="images/edit.png"> Edit this EOI</button> <button class="btnDelete googleLookAndFeel"><img style="vertical-align:middle" src="images/delete.png"> Delete this EOI</button> <button class="btnView googleLookAndFeel">Manage this EOI\'s media</button></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnEdit").bind("click", editEOI);	
        $(".btnDelete").bind("click", deleteEOI);        
        $(".btnView").bind("click", viewMediaEOI);
    }
    catch(e)
    {
        showMessage("Error when presenting all EOIs: " + e.message);
    }
} 

function showDropdownEOI()
{
    try
    {
        if(allEOIs.length < 1)
        {
            showMessage("There are no available EOIs. Please create EOIs first!");
        }
        else
        {
            var selectList = '<div class="formLabel">Please select an EOI</div><div><select id="allAvailableEOIs" class="inputText">';
            selectList = selectList + '<option value = "-1">Please select</option>';
            for(var i=0; i < allEOIs.length; i++)
			{
				selectList = selectList + '<option value = "' + i + '">' + allEOIs[i].eoiDesigner.name + '</option>';
			}
            selectList = selectList + '</select></div>';
            
            $('#dialog-message').html('');        
            $('#dialog-message').dialog({ title: "Select an EOI" });
            $('#dialog-message').append(selectList);            
            $("#dialog-message").dialog({
                modal: true,
                height: 200,
                width: 340,                
                buttons: {
                    Cancel: function() {
                        $(this).dialog("close");
                    },
                    "Add media": function() {                         
                        if($("#allAvailableEOIs").val()!="-1")
                        {
                            curEOI = allEOIs[$("#allAvailableEOIs").val()];                            
                            curMediaType = "EOI";
                            $(this).dialog("close");
                            selectMediaType();
                        }
                        else
                            showMessage("Please select an EOI from the dropdown list");
                    }             
                }
            });
        }
    }
    catch(e)
    {
        showMessage("Error when presenting all EOIs in a dropdown list: " + e.message);
    }
}

function addMediaEOI()
{ 
    var par = $(this).parent().parent(); //tr 
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex =  parseInt(tdIndex.text())-1;
    curEOI = allEOIs[tdIndex];
    callFrom = EOI_FORM;
    curMediaType = "EOI";
    selectMediaType();    
}

function viewMediaEOI()
{ 
    var par = $(this).parent().parent(); //tr 
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex =  parseInt(tdIndex.text())-1;
    curEOI = allEOIs[tdIndex];
    openFrom = EOI_FORM;
    curMediaType = "EOI";
    resfulManager.getMediaForEntity(curMediaType, curEOI.id);    
}

function editEOI()
{ 
    var par = $(this).parent().parent(); //tr 
    var tdName = par.children("td:nth-child(1)"); 
    curEOI = allEOIs[parseInt(tdName.text()-1)];       
    createNewEOI(false);    
}

function deleteEOI()
{ 
    var par = $(this).parent().parent(); //tr
    var tdIndex = par.children("td:nth-child(1)");
    tdIndex = parseInt(tdIndex.text()) - 1;
    curEOI = allEOIs[tdIndex];
    /*if(curEOI.mediaOrder.length>0)
    {
        showMessage("Please remove all the associated media before deleting this EOI");
        return;        
    }*/  
    
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Delete a POI"});        
    $('#dialog-message').append('<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>This EOI and its associated media will be permanently deleted and cannot be recovered. Are you sure?</p>');               
    $( "#dialog-message" ).dialog({
        modal: true,            
        height: 225,
        width: 460,            
        buttons: {             
            Cancel: function() {
                $( this ).dialog("close");
                showAllEOIs();
            },
            Yes: function() {                
                $( this ).dialog("close");                    
                //mDropBox.deleteEOI(curEOI);
                deleteAllMediaAndEntity(curEOI, '["D","EOIs","' + curEOI.id + '"]');
                allEOIs.splice(tdIndex,1); 
                 $("#noOfEOI").text("Number of EOIs: " + allEOIs.length);                        
                showAllEOIs();
            }             
        }
    });
}

function linkEOIs()
{
    $(function() {        
        $('#dialog-message').html('');        
        $('#dialog-message').dialog({ title: "Edit association between EOIs with POIs and Routes" });
        $('#dialog-message').append('<table width="100%" id="tblData"><thead><tr><th>No</th><th>Name</th><th>Event details</th><th>Action</th></tr></thead><tbody></tbody></table>');
        for(var i=0; i < allEOIs.length; i++)
        {
            $("#tblData tbody").append('<tr><td>' + (i+1) + '</td><td>' + allEOIs[i].eoiDesigner.name  + '</td><td>' + allEOIs[i].eoiDesigner.description + '</td><td nowrap style="text-align:center;"><img src="images/link.png" title="Edit association between EOI with POIs and Routes" class="btnSave"></td></tr>');
        } 
        $("#tblData").addClass("tableBorder");
        $("#tblData td").addClass("tableBorder");
        $("#tblData th").addClass("tableHeader");
        $(".btnSave").bind("click", editEOI);	
                
        $( "#dialog-message").dialog({
            modal: true,
            height: getHeightForDialog(allEOIs.length),
            width: 700,
            position: ['center','middle'],
            buttons: {                
                Close: function() {
                    $(this).dialog("close");                    
                }             
            }
        });
    });
}