const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // Request comes in
  // Check to see if cookies are attached to headers
  if (!req.cookies.shortlyid) {
    //If not, create a new session
    return models.Sessions.create()
      .then((hash) => {

        let id = hash.insertId;
        return models.Sessions.get({id});
      })
      .then((data) => {
        req.session = data;
        res.cookie('shortlyid', req.session.hash);
        next();
      })
      .catch((err) => {
        console.log('err', err);
      });
    //set hash to response header
  } else {
    var hash = req.cookies.shortlyid;
    // Check if incoming cookies exist within the session table
    return models.Sessions.get({hash})
      .then((data) => {
        if (req.cookies.shortlyid === data.hash) {
          // Set req.session to session data
          req.session = data;
          // If not, session is invalid
          // (Repeat above)
          next();
        }
      })
      .catch(() => {
        return models.Sessions.create()
        // Create a new session
          .then((hash) => {
            let id = hash.insertId;
            return models.Sessions.get({id});
          })
          .then((data) => {
            req.session = data;
            res.cookie('shortlyid', req.session.hash);
            next();
          })
          .catch((err) => {
            console.log('err', err);
          });
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (res, req, next) => {
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');
  }
  next();
};