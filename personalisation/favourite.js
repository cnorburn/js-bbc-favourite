define(["jquery-1",'personalisation/util','personalisation/web-storage','exports'],function($,util,personalisationWebStorage,exports) {

	// var options = {useCookies:false};

	
	/**
	* Function that will hold a collection of favourite objects
	* with internal methods
	*/
	favouritesHash=function(){
		var _favourites={};
		this._length=0;
		
		/**
		* Object to hold returned user favourites
		* JSON parsed and added to the array
		*/
		favouriteObj=function(itemId) {
		  this.itemId = itemId;
		  this._data = {};
		};
		
		this._delete=function(itemId){ 
			delete _favourites[itemId];
			this._length--;
		};

		this._push=function(favourite){
			_favourites[favourite.itemId]=favourite;
			this._length++;
		};
		
		this.inObject=function(itemId){
			return !! _favourites[itemId] ;
		};
		
		this.toJSONObject=function(){
			var json=this.toJSONString();
			if(json){
				return $.parseJSON(json);
			}else{
				return null;
			}
		};
		
		this.toJSONString=function(){
			if (!_favourites || _favourites==undefined) return null;
			var json='';
			for(item in _favourites){
				if (_favourites[item].itemId !=undefined){
					json+='{"id":"' + _favourites[item].itemId +
						'","appId":"' + _favourites[item]._data.appId +
						'","postedTime":"' + _favourites[item]._data.postedTime +
						'","anon":"' + _favourites[item]._data.anon +
						'","title":"' + _favourites[item]._data.title +
						'","type":"' + _favourites[item]._data.type + '"},';
				}
			}
			if (json==''){
				return null;
			}else{
				return '{"entry":[' +  json.substr(0,json.length-1) + ']}';
			}
		};
	};
	
	
	/*
	Event Listeners for debug
	*/
	var addDebugEvent=function(e,anon,data,errorState,errorThrown){
		if(console && console.log){
			console.log("--- Add favourite fired:",(anon) ? 'anonymous' : 'signed in',
							(data) ? data : '',
							(errorState) ? errorState : '',
							(errorThrown) ? errorThrown : '');
		}
	};
	$(exports).bind('_add',addDebugEvent);

	var removeDebugEvent=function(e,anon,data,errorState,errorThrown){
		if(console && console.log){
			console.log("--- Remove favourite fired:",(anon) ? 'anonymous' : 'signed in',
								(data) ? data : '',
								(errorState) ? errorState : '',
								(errorThrown) ? errorThrown : '');
		}
	};
	$(exports).bind('_remove',removeDebugEvent);

	var getDebugEvent=function(e,anon,data,errorState,errorThrown){
		if(console && console.log){
			console.log("--- Get favourite fired:",(anon) ? 'anonymous' : 'signed in',
							(data) ? data : '',
							(errorState) ? errorState : '',
							(errorThrown) ? errorThrown : '');
		}
	};
	$(exports).bind('_get',getDebugEvent);

	var getCountDebugEvent=function(e,anon,data,errorState,errorThrown){
		if(console && console.log){
			console.log("--- Get Count favourite fired:",(anon) ? 'anonymous' : 'signed in',
						(data) ? data : '',
						(errorState) ? errorState : '',
						(errorThrown) ? errorThrown : '');
		}
	};
	$(exports).bind('get-count',getCountDebugEvent);
	
	
	var errorEvent=function(e,_event,anon,data,errorState,errorThrown){
		if(console && console.log){
			console.log("--- Error event favourite fired: ", _event ,(anon) ? 'anonymous' : 'signed in',
						(data) ? data : '',
						(errorState) ? errorState : '',
						(errorThrown) ? errorThrown : '');
		}
	};
	$(exports).bind('_error',errorEvent);
	
	
	
	exports.get=function(sync,options,callback){
		
		var useLocal=false;
		if(options && options.forceUseLocalStorage) useLocal=true;
		if(options && options.forceUseCookies) useLocal=true;
		if(options && options.forceUseSignedIn){
			if ( !window.identity.user.isSignedIn()){
				if (callback){
					callback(null);
					return;
				}else{
					return null;
				}
			}
		}
		
		// if ((window.identity && window.identity.user && window.identity.user.isSignedIn() && !useLocal) 
		// 	|| (options && options.forceUseSignedIn))

		if (window.identity && window.identity.user && window.identity.user.isSignedIn() && !useLocal)
		{

			$.ajaxSetup({async:!!sync});
			
			$.ajax({
    	    	url: util.resolveURL('favourite/get'),
    	    	type: 'GET',
				dataType:'json',
    	    	contentType: 'application/json',
    	    	success: function(data, textStatus, jqXHR) {
					
					$(exports).trigger('_get',[false]);
					if (callback){
						callback(data);
					}else{
						return data;
					}
				},
    	    	error: function(XMLHttpRequest, textStatus, errorThrown) {
					var result={anon:false, data:null, errorStatus:textStatus, errorThrown:errorThrown};
					$(exports).trigger('_get',[false,null,textStatus,errorThrown]);
					//debug error event
					$(exports).trigger('_error',['get',false,null,textStatus,errorThrown]);
					//api error event
					$(exports).trigger('error',['get',false,null,textStatus,errorThrown]);
					if (callback){
						callback(null,result);
					}else{
						return null;
					}
    	    	}
    	    });
		
			$.ajaxSetup({async:!!!sync});
			
		}else{

			try{
				personalisationWebStorage.init('psp',options);
				var storage=personalisationWebStorage.get('fav',true);
				
				$(exports).trigger('_get',[true]);
				if (callback){
					callback($.parseJSON(storage));
				}else{
					return $.parseJSON(storage);
				}  
			}catch(e){
				var result={anon:true, data:null,errorStatus:e.name.toString(), errorThrown:e.message.toString()};
				$(exports).trigger('_get',[true,null,e.name.toString(),e.message.toString()]);
				//debug error event
				$(exports).trigger('_error',['get',false,null,e.name.toString(),e.message.toString()]);
				//api error event
				$(exports).trigger('error',['get',false,null,e.name.toString(),e.message.toString()]);
				
				if (callback){
					callback(null,result);
				}else{
					return null;
				}
			}
		
		}
	};
	
	
	exports.add=function(settings,options,callback){

		//first check limit not reached
		
		if(settings && (settings.limit && settings.appId)){
			var count=0;
			this.get(false,null,function(data){
				if (!data) return;
				for(item in data.entry){
					if(data.entry[item].appId==settings.appId) count++;
				}
			});
			if(count>=(settings.limit)){
				//raise an event - favourites limit reached
				$(exports).trigger('limit-reached',['add',count,settings.limit]);
				
				var result={limitReached:true};
				callback(result);
				return;
			}

		}

		var useLocal=false;
		if(options && options.forceUseLocalStorage) useLocal=true;
		if(options && options.forceUseCookies) useLocal=true;
		if(options && options.forceUseSignedIn){
			if ( !window.identity.user.isSignedIn()){
				if (callback){
					callback(null);
					return;
				}else{
					return null;
				}
			}
		}

		if (window.identity && window.identity.user && window.identity.user.isSignedIn() && !useLocal){
			
			var _json='{"title":"' + settings.title + '", "appId":"' + settings.appId + '", "type":"' + settings.type + '", "id":"' + settings.itemId + '"}';

			$.ajax({
    	    	url: util.resolveURL('favourite/add'),
    	    	type: 'POST',
    	    	contentType: 'application/json',
    	    	data: _json,
    	    	success: function(data, textStatus, jqXHR) {
					var result={anon:false, data:settings.itemId};
					$(exports).trigger('_add',[false,settings.itemId]);
					if (callback){
						callback(result);
					}else{
						return result;
					}  
     			  },
    	    	error: function(XMLHttpRequest, textStatus, errorThrown) {
					var result={anon:false, data:_json, errorStatus:textStatus, errorThrown:errorThrown};
					
					$(exports).trigger('_add',[false,settings.itemId,textStatus,errorThrown]);
					//debug error event
					$(exports).trigger('_error',['add',false,null,textStatus,errorThrown]);
					//api error event
					$(exports).trigger('error',['add',false,null,textStatus,errorThrown]);
					
					if (callback){
						callback(result);
					}else{
						return result;
					}  
    	    	}
    	    });

		}else{
			
			personalisationWebStorage.init('psp',options);

			var storage=personalisationWebStorage.get('fav');
			
			//build hash table from existing favourites if any
			var hash=new favouritesHash();
			
			// if(storage){
				hash=util.buildFavouriteObject($.parseJSON(storage));
			// }
				
			//add new favourite to hash
			favourite=new favouriteObj(settings.itemId);
			favourite._data["appId"]=settings.appId;
			favourite._data["postedTime"]=new Date().getTime() ;
			favourite._data["type"]=settings.type;
			favourite._data["title"]=settings.title;
			
			hash._push(favourite);
			var json=hash.toJSONString();
			
			try{
				personalisationWebStorage.set('fav',json);
				// personalisationWebStorage.testStorageLimit();
				
				var result={anon:true, data:settings.itemId};
				$(exports).trigger('_add',[true,settings.itemId]);
				if (callback){
					callback(result);
				}else{
					return result;
				}  
			}catch(e){
				
				result={anon:true, data:settings.itemId,errorStatus:e.name.toString(), errorThrown:e.message.toString()};
				$(exports).trigger('_add',[true,settings.itemId,e.name.toString(),e.message.toString()]);
				//debug error event
				$(exports).trigger('_error',['add',false,null,e.name.toString(),e.message.toString()]);
				//api error event
				$(exports).trigger('error',['add',false,null,e.name.toString(),e.message.toString()]);
				if (callback){
					callback(result);
				}else{
					return result;
				}  
			}
		}
		
	};
	
	exports.remove=function(settings,options,callback){

		var useLocal=false;
		if(options && options.forceUseLocalStorage) useLocal=true;
		if(options && options.forceUseCookies) useLocal=true;
		if(options && options.forceUseSignedIn){
			if ( !window.identity.user.isSignedIn()){
				if (callback){
					callback(null);
					return;
				}else{
					return null;
				}
			}
		}

		if (window.identity && window.identity.user && window.identity.user.isSignedIn() && !useLocal){

			$.ajax({
    	    	url: util.resolveURL('favourite/remove'),
    	    	type: 'POST',
    	    	contentType: 'application/json',
    	    	data: '{"type":"' + settings.type + '", "id":"' + settings.itemId + '"}',
    	    	success: function(data, textStatus, jqXHR) {
					var result={anon:false, data:settings.itemId};
					$(exports).trigger('_remove',[false,settings.itemId]);
					if (callback){
						callback(result);
					}else{
						return result;
					}
     			  },
    	    	error: function(XMLHttpRequest, textStatus, errorThrown) {
  					result={anon:false, data:_data, errorStatus:textStatus,errorThrown:errorThrown};
					$(exports).trigger('_remove',[false,settings.itemId,textStatus,errorThrown]);
					//debug error event
					$(exports).trigger('_error',['remove',false,null,textStatus,errorThrown]);
					//api error event
					$(exports).trigger('error',['remove',false,null,textStatus,errorThrown]);
					if (callback){
						callback(result);
					}else{
						return result;
					}  
   	    		}
    	    });
   	    }else{

			personalisationWebStorage.init('psp',options);

			var storage=personalisationWebStorage.get('fav');
			
			var hash=new favouritesHash();
			if(storage){
				hash=util.buildFavouriteObject($.parseJSON(storage));
			}
			
			hash._delete(settings.itemId);

			if (hash._length==0){
				personalisationWebStorage.remove('fav');
			}else{
				try{
					personalisationWebStorage.set('fav',hash.toJSONString());

					var result={anon:true, data:settings.itemId};
					$(exports).trigger('_remove',[true,settings.itemId]);
					if (callback){
						callback(result);
					}else{
						return result;
					}  
				}catch(e){
					result={anon:true, data:settings.itemId,errorStatus:e.name.toString(), errorThrown:e.message.toString()};
					$(exports).trigger('_remove',[true,settings.itemId,e.name.toString(),e.message.toString()]);
					//debug error event
					$(exports).trigger('_error',['remove',false,null,e.name.toString(),e.message.toString()]);
					//api error event
					$(exports).trigger('error',['remove',false,null,e.name.toString(),e.message.toString()]);
					if (callback){
						callback(result);
					}else{
						return result;
					}  
				}
			}
		}

	};
	
	exports.getCount=function(options,callback){
		
		var useLocal=false;
		if(options && options.forceUseLocalStorage) useLocal=true;
		if(options && options.forceUseCookies) useLocal=true;
		if(options && options.forceUseSignedIn){
			if ( !window.identity.user.isSignedIn()){
				if (callback){
					callback(null);
					return;
				}else{
					return null;
				}
			}
		}

		if (window.identity && window.identity.user && window.identity.user.isSignedIn() && !useLocal){


			$.ajax({
    	    	url: util.resolveURL('favourite/get'),
    	    	type: 'GET',
    	    	contentType: 'application/json',
				dataType:'json',
    	    	success: function(data, textStatus, jqXHR) {
					var hash=util.buildFavouriteObject((data));
					$(exports).trigger('get-count',[false,null]);

					if (callback){
						var result={anon:false, data:data};
						callback(hash._length,result);
					}else{
						return hash._length;
					}  
					
     			  },
    	    	error: function(XMLHttpRequest, textStatus, errorThrown) {
					var result={anon:false, data:_data, errorStatus:textStatus, errorThrown:errorThrown};
					$(exports).trigger('get-count',[false,settings.itemId,textStatus,errorThrown]);
					//debug error event
					$(exports).trigger('_error',['get-count',false,null,textStatus,errorThrown]);
					//api error event
					$(exports).trigger('error',['get-count',false,null,textStatus,errorThrown]);
					if (callback){
						callback(null,result);
					}  else {
						return null;
					}
    	    	}
    	    });

		}else{
		
			try{
				
				personalisationWebStorage.init('psp',options);
				var storage=personalisationWebStorage.get('fav',true);
				var hash=new favouritesHash();
			
				if(storage){
					hash=util.buildFavouriteObject($.parseJSON(storage));
				}
				$(exports).trigger('get-count',[true,null]);
				
				if (callback){
					var result={anon:true, data:null};
					callback(hash._length);
				}else{
					return hash._length;
				}  
				
			}catch(e){
				result={anon:true, data:null, errorStatus:e.name.toString(), errorThrown:e.message.toString()};
				$(exports).trigger('get-count'[true,null,e.name.toString(),e.message.toString()]);
				//debug error event
				$(exports).trigger('_error',['get-count',false,null,e.name.toString(),e.message.toString()]);
				//api error event
				$(exports).trigger('error',['get-count',false,null,e.name.toString(),e.message.toString()]);
				if (callback){
					callback(null,result);
				}else{
					return null;
				}  
			}
		}
	};
	
	
	exports.removeAll=function(){

		this.get(false,null,function(data){
			for(item in data.entry){
				var settings={type:data.entry[item].type,itemId:data.entry[item].id}
				exports.remove(settings,null)
			
			}
		});
		
	};
	
	exports.needsMigration=function(callback){
		
		var jsonSnes,jsonLocal;
		
		exports.get(true,null,function(data){
			jsonSnes=data;		

			var options={forceUseLocalStorage:true}
			
			exports.get(true,options,function(data){
				jsonLocal=data;		

				if (jsonLocal.entry.length==0){
					return false;
				}else{
					var json=new Array();
					json[0]=jsonSnes;
					json[1]=jsonLocal;
					$(exports).trigger('migrate',[json]);
					
					if (callback){
						callback(json)
					}else{
						return json;
					}
				}
			});
		});
		
	};
	
	exports.migrate=function(settings,json,callback){
		
		if(json==undefined) return;
		
		var hash=new favouritesHash();
		
		//add array of signed-in favourites
		util.buildFavouriteObject(json[0],hash,false);
		//add array of anonymous favourites
		util.buildFavouriteObject(json[1],hash,true);
		
		//json object of both signed-in and anonymous
		var _json=hash.toJSONObject();
		
		//sort into date descending order
		var _newJson=_json.entry.sort(function(a,b) { 
			return parseInt(a.postedTime) + parseInt(b.postedTime);
		});
		
		
		//grab the limits worth of favorites and stringify
		var jsonString=JSON.stringify(_newJson.slice(0,settings.limit));

		console.log(_newJson.slice(0,settings.limit),json[0]);

		_newJson=_newJson.slice(0,settings.limit);

		//ADD appId type id title
		//REMOVE type id
		
		/*
		Now create a merged json array object of _newJson and json[0]
		json[0]=snes favourites
		_newJson=merged anon/signed in favourites, duplicates removed, order by datetime, length <= limit
		
		Create two keys {'add':[ {...}],'remove':[ {....}]}
		
		Pass these to the PAL /migrate endpoint, then iterate each array accordingly
		
		*/
		
		
		
		// console.log(jsonString);
		
		//do the migrate
		$.ajax({
	    	url: util.resolveURL('favourite/migrate'),
	    	type: 'POST',
	    	contentType: 'application/json',
	    	data: jsonString,
	    	success: function(data, textStatus, jqXHR) {
				var result={anon:false, data:settings.itemId};
				$(exports).trigger('_migrate',[false,settings.itemId]);
				if (callback){
					callback(result);
				}else{
					return result;
				}  
 			  },
	    	error: function(XMLHttpRequest, textStatus, errorThrown) {
				var result={anon:false, data:_json, errorStatus:textStatus, errorThrown:errorThrown};
				
				$(exports).trigger('_migrate',[false,settings.itemId,textStatus,errorThrown]);
				//debug error event
				$(exports).trigger('_error',['migrate',false,null,textStatus,errorThrown]);
				//api error event
				$(exports).trigger('error',['migrate',false,null,textStatus,errorThrown]);
				
				if (callback){
					callback(result);
				}else{
					return result;
				}  
	    	}
	    });
		
		//clear anonymous favourites
		
		
		
		
	};
	
	
	
	
	
		
});

