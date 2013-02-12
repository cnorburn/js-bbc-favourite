define('favourite',['jquery-1','plugins/favourite/ui','personalisation/favourite','exports'], 
	function($,ui,personalisation,exports) {

		exports.addFavourite = function(obj,options) {
			ui.FavouritePlugin.addFavourite(obj,options);
		};
		
		var options={};
		
		// var options = {
		// 		limit:5,
		// 		addText: false, 
		// 	    removeText: false,
		// 		forceUseCookies:false,
		// 		forceUseLocalStorage:false,
		// 		forceUseSignedIn:false
		// 	    };
		
		$('.p-f').each(function(){
			exports.addFavourite($(this),options);
		});
		
		ui.FavouritePlugin.refresh(options,function(_count){
			$('#count p span').html(_count);
		});
		
		/*
			Example of get favourites using the personalisation client library
		*/
		// personalisation.get(true,null,function(json){
		// 	// console.log(json);
		// })
		
		var changeFavouriteEvent=function(e,_event,id){
			if(console && console.log){
				console.log("Favourite button change event: ", _event, id);
			}
			//Get the updated favourites count
			// ui.FavouritePlugin.getCount(null,function(_count){
			// 	$('#count p span').html(_count);
			// });
			
		};
		$(ui).bind('change',changeFavouriteEvent);
		
		var errorFavouriteEvent=function(e,_event,anon,data,error,msg){
			if(console && console.log){
				console.log("Favourite button error event: ", _event, (anon) ? 'anonymous' : 'signed in', data,error,msg);
			}
		}
		$(ui).bind('error',errorFavouriteEvent);
		
		var errorPersonalisationEvent=function(e,_event,anon,data,error,msg){
			if(console && console.log){
				console.log("Personalisation client library error event: ", _event, (anon) ? 'anonymous' : 'signed in', data,error,msg);
			}
		}
		$(personalisation).bind('error',errorPersonalisationEvent);
		
		var limitReachedPersonalisationEvent=function(e,_event,count,limit){
			if(console && console.log){
				console.log("Personalisation client library favourites limit reached: " + count + " favourites. Limit is " + limit);
			}
		}
		$(personalisation).bind('limit-reached',limitReachedPersonalisationEvent);
		
		var limitReachedFavouritesEvent=function(e,_event){
			if(console && console.log){
				console.log("Favourite button limit reached: ");
			}
		}
		$(ui).bind('limit-reached',limitReachedFavouritesEvent);
		
		
		/*migration stuff */

		var migrationNeeded=function(e,json){
			if(console && console.log){
				console.log("Personalisation client library anonymous to signed-in migration needed ");
			}
		}
		$(personalisation).bind('migrate',migrationNeeded);
		

		// if(document.location.host!='pal.sandbox.dev.bbc.co.uk'){
		//     idProperties.secureServer='https://'+document.location.host;
		// 	console.log(idProperties.secureServer);
		// }
		// identity.status.enableJavaScript();
		
		// identity.enableJavaScript();
		// var handlerId = window.identity.addSigninHandler(function(){
		// 	console.log('Login event fired')
		// });
		// var handlerIdx = window.identity.addLoginHandler(function(){
		// 	console.log('Login x event fired')
		// });
		
		
	} 
);