/*
    Author:     Trien Do    
    Created:    Oct 2014
    Tasks:      Implement functions of Your account menu
*/ 

//handle login/logout tasks
function login()
{
    mDropBox.logIn();
}

function showLoginDialog()
{
    //window.location.href = 'http://' + callbackURL;
    $('#dialog-message').html('');        
    $('#dialog-message').dialog({ title: "Sharc Locative media Authoring Tool"});
    var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome');
    if(is_chrome == -1)//Not chrome           
        $('#dialog-message').append('<p>We strongly recommend that you use the Google Chrome browser. Please select a cloud service to log in with</p>');
    else
        $('#dialog-message').append('<p>Please select a cloud service to log in.</p>' 
                                        + '<ul><li>If you log in with Dropbox, your media files will be stored in Dropbox\\Apps\\SHARC20 folder</li><br/>'
                                        + '<li>If you log in with Google Drive, your media files will be stored in Google Drive\\SHARC20 folder</li></ul>');               
    $( "#dialog-message" ).dialog({
        modal: true,            
        height: 250,
        width: 400,            
        buttons: {
            "Log in with Dropbox": function() {                
           	    cloudManager = new SharcDropBox();
                cloudManager.logIn();
                $( this ).dialog("close");                
            }, 
            "Log in with Google Drive": function() {                
           	    cloudManager = new SharcGoogleDrive();
                cloudManager.logIn();
                $( this ).dialog("close");                
            }            
        }
    });
}

//Show About us dialog
function showAboutUs()
{
    var content = 
       '<table>'
       +     '<tr>'
       +         '<td rowspan="2"><img style="width:48px; height:48px;" src ="images/sharc.png"/></td>'
       +         '<td style="font-size:16px;font-weight:bold;margin-top:3px;margin-bottom: 0px;">SLAT - Sharc Locative media Authoring Tool</td>'                
       +     '</tr>'
       +     '<tr>'              
       +         '<td>A tool for rapidly and easily designing and sharing locative media experiences</td>'
       +     '</tr>'
       +     '<tr>'
       +         '<td colspan="2"><br/>Together with SPET and SMEP, SLAT is one of the three primary components of the SHARC framework developed as part of the SHARC project.'
       +          ' SLAT allows designers to design and share locative media experiences. Consumers then can explore these experiences using SPET. Finally, SMEP lets consumers explore and load these experiences using their smartphone or tablet.</td>'                
       +     '</tr>'
       +     '<tr>'
       +         '<td colspan="2"><br/>Explore experiences with SPET: <a target="_blank" href="spet.php">http://wraydisplay.lancs.ac.uk/sharcauthoring/spet.php</a></td>'              
       +     '</tr>'
       +     '<tr>'
       +         '<td colspan="2">Download SMEP: <a target="_blank" href="https://play.google.com/store/apps/details?id=uk.lancs.sharc">https://play.google.com/store/apps/details?id=uk.lancs.sharc</a></td>'         
       +     '</tr>'
       +     '<tr>'
       +         '<td colspan="2"><br/><br/><b>SLAT ' + version + '</b><br/>Copyright 2015.'
       +         '<br/>School of Computing and Communication, Lancaster University.<br/>All rights reserved.'
       +         '<br/>Email: <a href="mailto:thesharcproject@gmail.com">thesharcproject@gmail.com</a>'
       +         '<br/>Website: <a target="_blank" href="https://thesharcproject.wordpress.com">https://thesharcproject.wordpress.com</a></td>'                
       +     '</tr>'
       + '</table>';
        
    $('#dialog-confirm').html('');        
    $('#dialog-confirm').dialog({ title: "About SLAT"});           
    $('#dialog-confirm').append(content);
    $("#dialog-confirm").dialog({
        modal: true,
        width: 600,
        height: 430,
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });   
}

//show user manual page
function showHelp()
{
    /*var projectName = prompt("Please enter project ID", "");
    if (projectName != null) 
    {
        mDropBox.deleteDatastore(projectName);
    }*/
    window.open('usermanual.php','_blank');
}