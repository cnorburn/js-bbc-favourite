define(['require','exports','module'], function(require,exports,module) {

	var BASE_DIR='/modules/personalisation/',
		hostname,
		statichostname,
		feedsHostname,
		envRegEx = new RegExp('https?://static\\.(.+?)?\\.?bbc\\.co\\.uk/.+');

	exports= {
		//Parse the path to get the pal domain
		//Append the snes endpoint
		
		//Resolve against static - css
		//Resolve against PAL - posts
		//Resolve against CDN - gets
		getEnv:function(){
			
			if (envRegEx.test(module.uri)) {
				var matches = envRegEx.exec(module.uri);
				if (matches && matches[1]) {
					return matches[1];
				} else {
					return;
				}
			}
			
		},
		
		getPALHost:function(){
			
			var env=exports.getEnv(),
			
			isSandbox = (env == 'sandbox.dev');

			return [(isSandbox ? 'pal.' : 'www.'), env, (env == '' ? '':'.'), 'bbc.co.uk' ].join('');
			
		},
		
		getStaticHost:function(){

			var env=exports.getEnv();
			
			return ['static', (env == '' ? '':'.'), env, '.bbc.co.uk'].join('');
			
		},
		
		//TODO
		getCDNHost:function(){},
		
		
		/**
		 * Resolves a relative URL against the PAL or static assets host as determined by the environment.
		 *
		 * @param {string} url Relative URL to resolve.
		 * @param {boolean} useStatic When true, resolve against the static hostname instead of the PAL.
		 * @return {string|undefined} Resolved URL or undefined when not passed a string.
		 */
		resolveURL: function(url, host) {
			
			if (!typeof url == 'string') { return undefined; }

			host = host || exports.getPALHost();

			var base = (url.charAt(0) == '/') ? '' : BASE_DIR;

			return [window.location.protocol, '//', host, base, url].join('');
		},


		/**
		 * Resolves a relative URL against the static assets host as determined by the environment.
		 *
		 * @param {string} url Relative URL to resolve.
		 * @return {string|undefined} Resolved URL or undefined when not passed a string.
		 */
		resolveStaticURL: function(url) {
			return resolveURL(url,  exports.getStaticHost());
		},

		//TODO
		resolveFeedURL: function(url) {
			// return resolveURL(url, feedsHostname);
		},
		
		/**
		 * @name identity.util.getCookie
		 * @function
		 * @description Parses a cookie with a given name.
		 *
		 * @param {string} name The name of the cookie to retrieve from the browser.
		 * @return {string|null} The RAW string value of the cookie, or null if the cookie isn't set.
		 */
		getCookie : function(name) {
		
			try{
				var nameEQ = [name,"="].join('');
				var ca = document.cookie.split(';');
				for(var i=0;i < ca.length;i++) {
					var c = ca[i];
					while(c.charAt(0)==' '){
						c = c.substring(1,c.length);
					}
					if(c.indexOf(nameEQ)===0){
						return c.substring(nameEQ.length,c.length);
					}
				}
				return null;
			}catch(e){
				throw new Error(e.name.toString(),e.message.toString());
			}
		},
		
		
		buildFavouriteObject : function(json,_hash,anon){
			
			if (!_hash) {
				var hash=new favouritesHash();
			}else{
				var hash=_hash;
			}
		
			if (json==undefined) return hash;
			
			for(item in json.entry){
				
				//edge case where the same item is favourited anon 
				//and signed in when doing a migrate
				if(hash.inObject(json.entry[item].id)){
					continue;
				}

				favourite=new favouriteObj(json.entry[item].id);
				favourite._data["appId"]=json.entry[item].appId;
				favourite._data["postedTime"]=json.entry[item].postedTime;
				favourite._data["type"]=json.entry[item].type;
				favourite._data["title"]=json.entry[item].title;
				
				if(anon!=undefined){
					favourite._data["anon"]=(anon) ? true : false;
				}
				
				hash._push(favourite);
			}
		
			return hash;
			
		}
		
		
	};
	
	return exports;
});