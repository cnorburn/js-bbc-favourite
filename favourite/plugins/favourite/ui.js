define(["jquery-1",'personalisation/favourite','exports'],function($,personalisation,exports) {

	var 
	FavouritePlugin;

	var favouriteButtons=new Array();
	var favouriteButtonMap={};
	var favouritePluginCount = 0;
	
	//TODO call _data globalOptions
	var _data={};
	
	var addEventListener=function(object, eventName, callback) {
		$(object).bind(eventName, callback);
	};
		
	exports.FavouritePlugin = FavouritePlugin = function(obj,options) {
		
		if(options){
			this.addText=options.addText || 'Add to Favourites';
			this.removeText=options.removeText || 'Remove from Favourites';
		}else{
			this.addText='Add to Favourites';
			this.removeText='Remove from Favourites';
		}

		var obj = $(obj); // jquery object
		var settings = {
	      appId: obj.attr('data-appId'),
	      type: obj.attr('data-type'),
	      itemId: obj.attr('id'),
	      title: obj.attr('data-title'),
	      limit: obj.attr('data-limit')
	    };
		var buttonRef=this;
		
		this.settings=settings;
		
		var favouritePluginHTML = '<span class="p-f-button"><span class="p-f-off"></span></span>' + 
									'<span class="p-f-text"><span class="p-f-off">' + this.addText + '</span></span>';
	
		obj.html(favouritePluginHTML);

		addEventListener(obj, 'click', function() {
			if(obj.hasClass('p-f-on')){
				buttonRef.removeFavourite();
			}else{
				buttonRef.addFavourite();
			}
		});

		addEventListener(obj, 'mouseenter', function() {
			if(obj.hasClass('p-f-on')){
				obj.find('.p-f-text span').removeClass('p-f-off');	
			} else {
				obj.find(' span span').removeClass('p-f-off');
			}
		});
		addEventListener(obj, 'mouseleave', function() {
			if(obj.hasClass('p-f-on')){
				obj.find(' .p-f-text span').addClass('p-f-off');	
			} else {
				obj.find(' span span').addClass('p-f-off');
			}
		});
		
		this.setState=function(state){
			
			if(!state){
				obj.addClass('p-f-off').removeClass('p-f-on');
				obj.find('span span').addClass('p-f-off');
				obj.find('.p-f-text span').html(buttonRef.addText).addClass('p-f-off');
			}else{
				obj.removeClass('p-f-off').addClass('p-f-on');
				obj.find('span span').removeClass('p-f-off');
				obj.find('.p-f-text span').html(buttonRef.removeText).addClass('p-f-off');
			}
		};
		
		this.addFavourite=function(){
	
			personalisation.add(settings,options,function(result){
				if(result && result.limitReached){
					$(exports).trigger('limit-reached',['add']);
					return;
				}
				if(result && result.errorStatus){
					$(exports).trigger('error',['add',result.anon,result.data,result.errorStatus,result.errorThrown]);
					return;
				}
				buttonRef.setState(true);
				$(exports).trigger('change',['add',settings.itemId]);
			});
		};
		
		this.removeFavourite=function(){
			personalisation.remove(settings,options,function(result){
				if(result && result.errorStatus){
					$(exports).trigger('error',['remove',result.anon,result.data,result.errorStatus,result.errorThrown]);
					return;
				}
				buttonRef.setState(false);
				$(exports).trigger('change',['remove',settings.itemId]);
			});
		};

		this.isFavourited=function(){};

		this.refresh=function(){};
		
		this.getId=function(){
			return settings.itemId;
		};
			
	};
	
	FavouritePlugin.getFavourites=function(options,callback){
		personalisation.get(true,options,function(hash){
			callback(hash);
		});
	};

	FavouritePlugin.getCount=function(options,callback){
		personalisation.getCount(options,function(count){
			callback(count);
		});
	};

	FavouritePlugin.addFavourite = function(elem,options) {
		
		var favouritePlugin = new FavouritePlugin(elem,options);

		var existing=favouriteButtonMap[favouritePlugin.getId()];
		if(!existing){
			existing=favouriteButtonMap[favouritePlugin.getId()]=[];
		}
		existing.push(favouritePlugin);
		
		favouriteButtons[favouritePluginCount]=favouritePlugin;
		favouritePluginCount++; 
		
		return favouritePlugin;
	};
		
	
	/*

	*/
	FavouritePlugin.refresh=function(options,callback){

		// var _options;
		// if (options instanceof Function) {
		// 	_options=data;
		// }else{
		// 	//limits,appId object
		// 	if(data) _data=data;
		// 	_options=options;
		// }
		
		personalisation.get(true,options,function(favourites){

			for(button in favouriteButtons){
				if(favourites!=undefined){
					
					//TODO parse the json more efficiently than a nested for each
					var match=false;
					for(item in favourites.entry){
						if(favouriteButtons[button].getId()==favourites.entry[item].id){
							match=true;
							break;
						}
					}
					
					if(match){
						favouriteButtons[button].setState(true);
					}else{
						favouriteButtons[button].setState(false);
					}
				}else{
					favouriteButtons[button].setState(false);
				}
			}
			if (callback){
				if(favourites){
					callback (favourites.length)
				}else{
					callback (0)
				}
			}

		});
		
	};
		
		
	
});