define('favourite',['jquery-1','plugins/favourite/ui','personalisation/favourite','exports'], 
	function($,ui,personalisation,exports) {
		
		// getAllUserFavourites();
		
		$('#generate').bind('click', function(){

			$('#msg').html('');
			$('.bbc-fav-test fieldset div span').removeClass('err').addClass('required');
			
			var id=$('#bbc-fav-test-id').val();
			var title=$('#bbc-fav-test-title').val();
			var appId=$('#bbc-fav-test-appid').val();
			var type=$('#bbc-fav-test-type').val();
			
			if(!id || !title || !appId || !type){
				if (!id) $('#bbc-fav-test-id').next().removeClass('required').addClass('err');
				if (!title) $('#bbc-fav-test-title').next().removeClass('required').addClass('err');
				if (!appId) $('#bbc-fav-test-appid').next().removeClass('required').addClass('err');
				if (!type) $('#bbc-fav-test-type').next().removeClass('required').addClass('err');
				return;
			}


			if ($('#'+id).length){
				$('#msg').html('A Favourite button with this id already exists.');
				return;
			}
		
			if (isNaN(parseInt($('#limit').val()))){
				$('#msg').html('Please make limit a number');
				return;
			}
			

			var html='<div class="gel-heading2"><h2>' + title + '</h2>' +
					'<span class="p-f p-f-off" id="'+id+'" data-title="' + title + '" data-limit="'+ $('#limit').val() + '" data-appid="'+appId+'" data-type="'+type+'"></span><span class="bbc-fav-test-delete"><span>X</span></span></div>';
			
			$('#bbc-fav-test-button').append(html);
	
			var options={};
			var options={addText:$('#addText').val(),
						removeText:$('#removeText').val()};
	
			ui.FavouritePlugin.addFavourite($('#' + id),options);
			
			var settings={userLimit:parseInt($('#limit').val()),appId:appId};
			ui.FavouritePlugin.refresh(settings,null,null);

		});

		var changeFavouriteEvent=function(e,_event,id){
			console.log("Favourite button change event: ", _event, id);

			getAllUserFavourites();
		};
		$(ui).bind('change',changeFavouriteEvent);


		var limitReachedFavouritesEvent=function(e,_event){
			console.log("Favourite button limit reached: ");
			alert('Limit reached')
			
		}
		$(ui).bind('limit-reached',limitReachedFavouritesEvent);


		$('.bbc-fav-test-delete span').live('click',function(){
			$(this).parent().parent().remove();
		});


		$('#remove').bind('click', function(){
			personalisation.removeAll();
			getAllUserFavourites();
		});

		$('#migrate').bind('click', function(){
			if (isNaN(parseInt($('#limit').val()))){
				$('#msg').html('Please make limit a number');
				return;
			}
			settings={limit:$('#limit').val()}
			personalisation.needsMigration(function(json){
				if(json){
					personalisation.migrate(settings,json);
					getAllUserFavourites();
				}
			});
		});

		$('#render').bind('click', function(){
			
			if (isNaN(parseInt($('#limit').val()))){
				$('#msg').html('Please make limit a number');
				return;
			}
			
			personalisation.get(null,null,function(json){
				var appId;
				for(item in json.entry){
					var html='<div class="gel-heading2"><h2>' + json.entry[item].id + '</h2>' +
							'<span class="p-f p-f-off" id="'+json.entry[item].id+'" data-title="' + json.entry[item].id + '" data-appid="'+json.entry[item].appId+
							'" data-type="'+json.entry[item].type+'" data-limit="'+ $('#limit').val() + '"></span><span class="bbc-fav-test-delete"><span>X</span></span></div>';
					appId=json.entry[item].appId;
					$('#bbc-fav-test-button').append(html);
					ui.FavouritePlugin.addFavourite($('#' + json.entry[item].id),null);
				}
				
				// var settings={userLimit:parseInt($('#limit').val()),appId:appId};
				ui.FavouritePlugin.refresh(null,null);
				
			});
		});



		getAllUserFavourites=function(){
			var weekday=new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
			var monthname=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
			var faves;
			
			$('#bbc-fav-test-existing').html('');

			//get all user existing favourites
			options={forceUseCookies:true,forceUseLocalStorage:false,forceUseSignedIn:false}
			personalisation.get(true,options,function(json){
				if(json){
					faves='<strong>Cookies:</strong>';
					faves+='<ul class="bbc-fav-favourite">';
					for(item in json.entry){
						faves+='<li><strong>id: ' + json.entry[item].id + '</strong></li>';
						faves+='<li>appId: ' + json.entry[item].appId + '</li>';
						faves+='<li>type: ' + json.entry[item].type + '</li>';
						faves+='<li>title: ' + json.entry[item].title + '</li>';
						var _date=new Date(json.entry[item].postedTime * 1000 / 1000);
						var _formatttedDate=_date.getHours() + ':' + _date.getMinutes() + ' ' + 
							weekday[_date.getDay()] + ' ' + + _date.getDate() + ' ' + monthname[_date.getMonth()]  + ' ' + _date.getFullYear();
						faves+='<li>posted: ' + _formatttedDate + '</li>';
						faves+='<li class="dotted"></li>';
					}
					faves+='</ul>'
				}else{
					faves='<p><strong>Cookies: none</strong></p>';
				}
				$('#bbc-fav-test-existing').append(faves);
			})
			options={forceUseCookies:false,forceUseLocalStorage:true,forceUseSignedIn:false}
			personalisation.get(true,options,function(_json){
				if(_json){
					faves='<strong>Local Storage:</strong>';
					faves+='<ul class="bbc-fav-favourite"">';
					for(item in _json.entry){
						faves+='<li><strong>id: ' + _json.entry[item].id + '</strong></li>';
						faves+='<li>appId: ' + _json.entry[item].appId + '</li>';
						faves+='<li>type: ' + _json.entry[item].type + '</li>';
						faves+='<li>title: ' + _json.entry[item].title + '</li>';
						var _date=new Date(_json.entry[item].postedTime * 1000 / 1000);
						var _formatttedDate=_date.getHours() + ':' + _date.getMinutes() + ' ' + 
							weekday[_date.getDay()] + ' ' + + _date.getDate() + ' ' + monthname[_date.getMonth()]  + ' ' + _date.getFullYear();
						faves+='<li>posted: ' + _formatttedDate + '</li>';
						faves+='<li class="dotted"></li>';

					}
					faves+='</ul>'
				}else{
					faves='<p><strong>Local Storage: none</strong></p>';
				}
				$('#bbc-fav-test-existing').append(faves);
			})
			options={forceUseCookies:false,forceUseLocalStorage:false,forceUseSignedIn:true}
			personalisation.get(true,options,function(__json){
				if(__json){
					faves='<strong>SNES:</strong>';
					faves+='<ul class="bbc-fav-favourite"">';
					for(item in __json.entry){
						faves+='<li><strong>id: ' + __json.entry[item].id + '</strong></li>';
						faves+='<li>appId: ' + __json.entry[item].appId + '</li>';
						faves+='<li>type: ' + __json.entry[item].type + '</li>';
						faves+='<li>title: ' + __json.entry[item].title + '</li>';
						var _date=new Date(__json.entry[item].postedTime * 1000 / 1000);
						var _formatttedDate=_date.getHours() + ':' + _date.getMinutes() + ' ' + 
							weekday[_date.getDay()] + ' ' + + _date.getDate() + ' ' + monthname[_date.getMonth()]  + ' ' + _date.getFullYear();
						faves+='<li>posted: ' + _formatttedDate + '</li>';
						faves+='<li class="dotted"></li>';
					}
					faves+='</ul>'
				}else{
					faves='<p><strong>SNES: unknown</strong></p>';
				}
				$('#bbc-fav-test-existing').append(faves);
			})

		};
		
		options={};

		getAllUserFavourites();
		
	}
	
);