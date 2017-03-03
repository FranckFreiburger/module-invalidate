module.invalidable = true;
module.exports = {};

var interval = setInterval(function() {
	
	console.log('tick');
}, 100);

module.onInvalidate(function() {

	clearInterval(interval);
});
