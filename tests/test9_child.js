console.log('load child')

module.invalidable = true;
module.exports = {
	foo: 'bar'
};

var interval = setInterval(function() {
	
	console.log('tick');
}, 100);

module.onInvalidate(function() {

	clearInterval(interval);
});
