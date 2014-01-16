/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// The root URL for the RESTful services
var rootURL = "http://localhost:9000/Tweety/resources";

 function GetCookie (name) {
      var arg = name + "=";
      var alen = arg.length;
      var clen = document.cookie.length;
      var i = 0;
      while (i < clen) {
        var j = i + alen;
        if (document.cookie.substring(i, j) == arg)
          return getCookieVal (j);
    	i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
      }
      return null;
    }

//inscription d’un user 
function bindEventsOnReady() {

                        bindLogoutEvent();    
                        bindaddTweetEvent();
//                        var Cookie=document.cookie; 
//                        var arrCookies = Cookie.split("=");
                       // var CookieValue = document.cookie.split("=")[2];
                        var CookieValue = GetCookie(authCookie);
                        bindListTweetEvent(CookieValue);
                        removeLoadMore();
                        binddeleteTweetEvent();
                        bindPassPageAmisEvent(CookieValue);
}
function bindLogoutEvent() {
$('#Logout').click(function(){
    logout();
    return false;
 });
}

//fonction de deconnection
function logout(){
    console.log('deconnection');
    $.ajax({
         type: 'GET',
         url: rootURL +'/user/logout',
         dataType: "json",
         success: function(data){
                    console.log("vous etes deconnecté");
                    window.location.href="index.html";
                  
                },
         error: function(jqXHR, textStatus, errorThrown){
             console.log("problème de deconnection:"+errorThrown);
         }
    });
}

//------------------------------------Les amies-------------------------------------
//mes abonnement
function bindPassPageAmisEvent(username){
     console.log("bindPassPageAmisEvent:"+username);
    $('#mes_amis').click(function(){
       console.log("mes_amis");
       pageAmis(username);
       return false;
    });
}

function pageAmis(username){
    console.log('pageAmis');
    $.ajax({
        type:'GET',
        url: rootURL +'/user/pageAmis/'+username,
        dataType: "json",
        success :  function(d, textStatus, jqXHR){
            console.log(ok);
        },
        error : function(resultat, statut, erreur){
             console.log("not ok");
             console.log("status"+resultat.status); //affiche le code d erreur
         }
    });
}
//-------------------------------------Tweet------------------------------------------
//deconnection
function bindaddTweetEvent() {
$('#publier_button').click(function(){
    //console.log("idididididiididididididi");
    console.log("addTweet");
    addTweet();
    return false;
 });
}
//fonction addTweet
function addTweet(){
    console.log('addUser');
    console.log('Tweet '+$("#areaTweet").val());
    console.log('username '+$('#usernameonline').val());
    var data = $("#form-addTweet").serializeArray();
    $.ajax({
                type: 'POST',
                //contentType:'application/json',
                url: rootURL + '/Tweet/add',
                //dataType: "json",  // Le type de données à recevoir de service, ici, du json.
                data:data, //FormaddtweetToJSON(),
                success : function(d, textStatus, jqXHR){
                    console.log("tweet ajouté_add tweet");
                    // On ajoute le Tweet dans la page
                    console.log("avantprepend_add tweet");
                    window.location.href="tweety.html";
                },
                error : function(resultat, statut, erreur){
                    console.log("tweet non ajouté");
                    console.log("status"+resultat.status); //affiche le code d erreur
                    
                    
                }
            });
}
//affichage liste de Tweet d'un user
function bindListTweetEvent(username){
    
    $.get(rootURL+"/Tweet/"+username+"/0/5",
                    function(data){
        var i = 0;
        //console.log("attendtion");
        //console.log ("data "+data.toString());
        if(data.length != 0) 
        {
             $.each(data,function(key, val){
                i++;
                $("#List_Tweet").append(renderItem(val.id, val.label, val.sujet, val.datepublication, val.Taguser, val.user.username));
             });
             console.log("ajoutfini");  
        }else{
                $("#loadmore").remove();
                showWelcome();
             }
       
    },"json");
    }
    
function binddeleteTweetEvent() {
   // Clic sur le bouton delete pour supprimer un Tweet
    $(".delete").live("click",function(){

        var id = $(this).attr("href");
        console.log(id);

        $.ajax(id,
        {
            type:"DELETE",
            success: function(d){
                $("#Tweet-"+d).slideUp('slow',function(){
                    $(this).remove();
                    });
            }
        });
        
        if(removeLoadMore()){
            $("#loadmore").remove();
        }
        
        return false;

    });
}
function showWelcome(){
        $("#List_Tweet").html('<b>Vous avez pas de Tweets</b>');
    } 
//suppression du lien loadMore   
//suppression du lien loadMore   

function removeLoadMore()
    {
        var username = document.cookie.split("=")[2];
        $.get(rootURL+"/Tweet/count",function(data){
            var i = $("#List_Tweet").children().length;
            console.log("dans la bd : "+data+" | sur le site : "+i);
            if(data <= 5){
                console.log("true");
                $("#loadmore").remove();
            }else{
               $("<button  id='Loadmore' value='"+username+"'>Loadmore</button>").insertAfter("#main_contant");
                console.log("false");
               bindEventsLoadMore();
            }
                
        });

    }
    
    function bindEventsLoadMore() 
    {
	$('#Loadmore').click(function() {
           username=$(this).val();
           console.log(username);
	    LoadMore(username);
	});
    }

    function LoadMore(username){
	console.log("loadMore");  
        var From = $("#List_Tweet").children().length;
        console.log("From"+From);
        var To = From+1;
        console.log("TO"+To);
    
        $.get(rootURL+"/Tweet/"+username+"/"+From+"/"+To,
    					
			function(data){
				
				if(data.length != 0) 
				{				
					$.each(data, function(key, val) 
						{
						$("#List_Tweet").append(renderItem(val.id, val.label, val.sujet, val.datepublication, val.Taguser, val.user.username));
						});
				}else{
					$("#Loadmore").remove();
					$(".errormessage").append('<b> il n\'y a pas d\'autre Tweet à afficher</b>');
				}
			},"json");
              }
 // creation et ajout d'un article dans la page
 function renderItem(id, label, sujet, date, Taguser,userpropr)
    {
        var myDate = new Date( date );
        var strDate = "";
        strDate += myDate.getUTCDate()+"/"+(myDate.getMonth()+1)+"/"+myDate.getFullYear();
        strDate += " à "+myDate.getHours()+":"+myDate.getMinutes();
        return '<div class="box_2"><img src="bootstrap/img/box_2.png" alt=""  class="main_img_2" />'+
                                                 '<div class="text">'+
                                                  ' <h6>'+userpropr+'</h6>'+
                                                   '<h5>'+strDate+'</h5>'+
                                                   '<p>'+label+' #'+sujet+' @'+Taguser+'</p>'+
                                                 '</div></div>';      
                                          

                        //<a class='button blue delete' href='http://localhost:9000/Tweety/resources/Tweet"+id+"'>Supprimer</a>\n\
    }
    
     
$().ready(function(){
 bindEventsOnReady();
});

