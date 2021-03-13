const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('req.cookies', req.cookies.shortly);
  // Request comes in
  // Check to see if cookies are attached to headers
  if (!req.cookies.shortlyid) {
    console.log('no cookies');
    //If not, create a new session
    return models.Sessions.create()
      .then((hash) => {
        console.log('hash', hash);
        let id = hash.insertId;
        return models.Sessions.get({id});
      })
      .then((data) => {
        // console.log('data', data);
        req.session = data;
        console.log('req.session', req.session);
        res.cookie('shortlyid', req.session.hash);

        // res.send('cookie set');
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
        console.log('data', data);
        // If it matches, session is valid
        if (!data) {
          return models.Sessions.create()
          // Create a new session
            .then((hash) => {
              console.log('hash', hash);
              let id = hash.insertId;
              return models.Sessions.get({id});
            })
            .then((data) => {
              // console.log('data', data);
              req.session = data;
              console.log('req.session', req.session);
              res.cookie('shortlyid', req.session.hash);

              // res.send('cookie set');
              next();
            })
            .catch((err) => {
              console.log('err', err);
            });
        } else if (req.cookies.shortlyid === data.hash) {
          // Set req.session to session data
          req.session = data;
          // If not, session is invalid
          // (Repeat above)
          next();
        }
      });
  }

  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

