module('Favourites module tests');

require(['personalisation/favourite'], function(favourite) {
	
	test("Favourites tests", function() {
		ok(typeof favourite.get == 'function', 'Function: favourite.get exists');
	});
	
	/* // Async test
	asyncTest('Asynchronous get', function() {
		// note: test runner will exec this function, then wait for a start() command
		// - useful to test async callbacks
	});
	
	*/
	
});