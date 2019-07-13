var nodemailer = require("nodemailer");
var self = exports;



exports.sendEmail = function(user, token, callback) {

	console.log('me chamaram');

	var smtpTransport = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	       user: "maissaude.suporte@gmail.com",
	       pass: "suporte_m@is$$"	       
	    }
	});	

	var mailOptions = {
		from: "maissaude.suporte@gmail.com", // sender address.  Must be the same as authenticated user if using Gmail.
		to: user.email, // receiver
		subject: "MaisSaude - Token para troca de email", // subject
		text: "Sr. " + user.name + " seu token para alteração de senha é " + token, // body
		html: '<b>Sr. ' + user.name + ' seu token para alteração de senha é ' + token + '</b>' // html body
	};

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	    }else{
	        console.log('Message sent: ' + info.response);
	    }
	   
   		smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.

		return callback();

	});


};
