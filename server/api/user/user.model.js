'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  tipoPessoa: { type: String, default: '1' },
  email: { type: String, lowercase: true },
  email_alternativo: { type: String, lowercase: true },
  login: { type: String, lowercase: true },
  phone: String,
  contato_phone: String,
  celPhone: String,
  name: String,
  lastName: String,
  simpleName: String,
  motherName: String,
  birthday: Date,
  doc1:String,
  doc2:String,
  nacionality: String,
  profession: String,
  civil: String,
  gender: String,
  notifications: Array,

  razaoSocial:String,
  nomeFantasia:String,
  contact:String,
  contactDoc1:String,
  //role: { type : Schema.ObjectId, ref: 'Role' },
  role: {type:String, default:'user'},
  addressType: String,
  postalCode:String,
  addressStreet:String,
  addressNumber:String,
  addressComplement:String,
  addressState:{ type: Schema.ObjectId, ref: 'Estado' },
  addressCity:{ type: Schema.ObjectId, ref: 'Cidade' },
  addressRegion:String,
  interestCategories:[{ type : Schema.ObjectId, ref: 'Categorie' }],
  howKnown:String,
  hashedPassword: String,
  provider: String,
  salt: String,
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  image: { type: Schema.ObjectId, ref: 'Image' },
  codigo: { type: String, default: '' },
  roleId : { type: Schema.ObjectId, ref: 'Role' },
  tipoAcesso: Number,
  resetPassword: { type: Boolean, default: false },
  funcionario: { type: Boolean, default: false },
  comitente: { type: Schema.ObjectId, ref: 'Comitente' },
  createdAt: { type: Date, default: new Date() },
  grandMaster: { type: Boolean, default: false },
  firstAccess: { type: Boolean },
  idAntigo: Number
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value, deleted: false}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
