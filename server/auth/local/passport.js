var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password', // this is the virtual field on the model
    passReqToCallback: true
  },
    function (req, email, password, done) {

      console.log('------');
      console.log(req.body);
      //console.log(req.body.fbId);
      console.log('------');

      User.findOne({
        $or: [{ email: email.toLowerCase() }, { login: email.toLowerCase() }]
      }, function (err, user) {
        if (err) return done(err);
        console.log(user);


        if (!user) {
          return done(null, false, 'public.user.EMAIL_NOT_FOUND');
          // return done(null, false, { message: 'Email não registrado.', code: 'public.user.EMAIL_NOT_FOUND' });
          // return done(null, false, { message: 'This email is not registered.' });
        }

        if (user.active == false) {
          console.log('Usuário inativo.');
          return done(null, false, 'public.user.unactive');
          // return done(null, false, { message: 'Usuário inativo.', code: 'public.user.unactive' });
          // return done(null, false, { message: 'This email is not registered.' });
        }

        // console.log('meu fb ' + req.body.fbId + ' o gravado '+ user.fbid);

        if (req.body.fbId) {
          if (req.body.fbId !== user.fbid && !user.authenticate(password)) {
            return done(null, false, { message: 'Este email não esta vinculado ao facebook.', code: 'NOT_FB_EMAIL' });
          }
        } else if (!user.authenticate(password)) {
          return done(null, false, 'public.user.WRONG_PWS');
        }

        console.log('retorna aqui');
        return done(null, user);
      });
    }
  ));
};