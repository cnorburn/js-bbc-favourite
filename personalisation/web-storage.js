define(['personalisation/util'],function(util) {

	var personalisationWebStorage = {}
		
	var namespace;
	var useCookies=true

	personalisationWebStorage.init = function(namespace,options) {

		try{
			//accesing localstorage when user disabled will throw errors in some browsers
			if(typeof(window.localStorage) == 'undefined'){ 
				useCookies=true;
			}else{
				useCookies=false;
			}
		}catch(e){
			useCookies=true;
		}
		
		if(options && options.forceUseCookies){
			useCookies=true;
		}
		if(options && options.forceUseLocalStorage){
			useCookies=false;
		}

		//TODO Check cookies enabled via a util method util.areCookiesEnabled
		
		personalisationWebStorage.setNamespace(namespace);
		
		return true;
		//some more stuff
	
	};

	personalisationWebStorage.setNamespace = function(ns) {
		namespace=ns + ':';
	};

	personalisationWebStorage.set = function(key,value) {
	
		try{
	
			(useCookies) ? document.cookie = namespace + key + '=' + value + ';path=/;domain=.bbc.co.uk'
						 : window.localStorage.setItem(namespace + key,value); 
						
		}catch(e){
			
			if(e.name.toString()=='QUOTA_EXCEEDED_ERR'){
				throw new Error(
				 "Local Storage Limit Reached",
				  "Error detected. Local Storage Limit Reached"
				);
			}else{
				throw new Error(e.name.toString(),e.message.toString());
			}
		}
		

	};

	personalisationWebStorage.get = function(key,json) {
		
		var ret;
		
		try{

			if(useCookies){
				ret=util.getCookie(namespace + key);
			}else{
				ret=window.localStorage.getItem(namespace + key); 	
			}
			
			if(!ret && json){
				ret='{"entry":[]}';
			}

			return ret;
			
		}catch(e){
			throw new Error(e.name.toString(),e.message.toString());
		}
	};

	personalisationWebStorage.remove = function(key) {
		window.localStorage.removeItem(namespace + key); 
	};

	personalisationWebStorage.clear = function() {
		window.localStorage.clear(); 
	};

	personalisationWebStorage.toString = function() {
		var string='';
		for (var i = 0; i < localStorage.length; i++){
			string+=localStorage.getItem(localStorage.key(i));
		}
		return string;
	};

	personalisationWebStorage.toArray = function() {
		var array=new Array();
		for (var i = 0; i < localStorage.length; i++){
			array[localStorage.key(i)]=localStorage.getItem(localStorage.key(i));
		}
		return array;
	};

	personalisationWebStorage.testStorageLimit=function(){
		localStorage.removeItem("DATA");
	
		for(i=0 ; i<40 ; i++) {
		    var data = this.get("DATA");
			try{
		    	this.set("DATA", data + data);
			}catch(e){
				localStorage.removeItem("DATA");
				console.log('testStorageLimit error: ' + e)
				throw new Error(e);
			}
		}
		
		localStorage.removeItem("DATA");
		
	}


	return personalisationWebStorage;
	
});
