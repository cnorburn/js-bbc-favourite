module('Personalistation web-storage module tests');

require(['personalisation/web-storage'], function(storage) {
	
	test("web-storage tests", function() {
		raises(storage.testStorageLimit,'throws error');
	});
	
	/* // Async test
	asyncTest('Asynchronous get', function() {
		// note: test runner will exec this function, then wait for a start() command
		// - useful to test async callbacks
	});
	
	*/
	
});