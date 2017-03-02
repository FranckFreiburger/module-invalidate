module.invalidable = true;
module.exports = {};

setInterval(function() {
	console.log(module.exports.foo);
}, 1000);
