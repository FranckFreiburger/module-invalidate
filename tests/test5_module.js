module.invalidable = true;

var count = 0;

exports.count = function() {

    return count += 1;
}
