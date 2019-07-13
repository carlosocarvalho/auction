'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            3504,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/leiloar2'
  },
  seedDB: true,
  MAIL_KEY:'key-fcecfd6a84d4fa4d28c89bcc7e996e04',
  MAIL_DOMAIN:'mail.quasarmobile.com' ,
    BASE_URL:'http://146.185.136.27:3510'
};