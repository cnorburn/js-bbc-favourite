module('Personalistation utilities module tests');

require(["jquery-1",'personalisation/favourite','personalisation/util'], function($,personalisation,util) {
	
	test("util tests", function() {
		ok(util.buildFavouriteObject($.parseJSON('{"entry":[{"id":"athletics","appId":"athletics","postedTime":"1319189945146","type":"athletics"},{"id":"gymnastics","appId":"gymnastics","postedTime":"1319189948397","type":"gymnastics"}]}'))
			);
	});
	
	/* // Async test
	asyncTest('Asynchronous get', function() {
		// note: test runner will exec this function, then wait for a start() command
		// - useful to test async callbacks
	});
	
	*/
	
});