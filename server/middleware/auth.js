const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // console.log(req);
  // Request comes in
  // Check to see if cookies are attached to headers
  // console.log('req', req);
  if (!req.headers.cookies) {
    // If not, create a new session
    //create new hash
    //var newSess = new models.Sessions();
    return models.Sessions.create()
      .then((hash) => {
        res.send(hash);
        //console.log('hash', hash);
      })
      .catch((err) => {
        console.log('err', err);
      });

    //set hash to response header
  }
  // Else,



  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

