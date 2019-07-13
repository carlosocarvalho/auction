var self = exports; 

const KEY_MAX_LEN = 6;

exports.newKey = function(){
	
	var key = "";
	for (var i = 0; i < KEY_MAX_LEN; i++) {
	    key += self.randomIntInc(1,10);
	}
	
	return key;
};

exports.randomIntInc = function(low, high){
	return Math.floor(Math.random() * (high - low + 1) + low);
};

	

