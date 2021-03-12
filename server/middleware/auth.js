const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // console.log(req);
  // // Request comes in
  // // Check to see if cookies are attached to headers
  // // console.log('req', req);
  // if (!req.cookies) {
  //   // If not, create a new session
  //   //create new hash
  //   //var newSess = new models.Sessions();
  //   return models.Sessions.create()
  //     .then((hash) => {
  //       // let id = hash.insertId;
  //       // return models.Sessions.get({id});
  //     })
  //     .then((data) => {
  //       //console.log('data', data);
  //       // req.session = data;
  //       // res.cookie('shortlyid', data.hash);

  //       // res.send('cookie set');
  //       next();
  //     })
  //     .catch((err) => {
  //       console.log('err', err);
  //     });

  //   //set hash to response header
  // }
  // Else,

  // Taking in potential string to be resolved
  // Check if the string exists
  // If no string, do something
  // Otherwise, check if the cookie is valid by comparing with cookie stored in db
  // // Check to see if session is valid
  // // if no session, do something (.tap)
  // // // Initialize a new session with models.Sessions.create()
  // // // Get hash from db
  // // // set the response cookie
  // // If session ...



  Promise.resolve(req.cookies.shortlyid)
    .then((hash) => {
      if (!hash) {
        throw Error;
      } else {
        // console.log('hash', hash);
        return models.Sessions.get({hash});
      }
    })
    .catch((session) => {
      return models.Sessions.create()
        .then((session) => {
          console.log('session', session);
        });
    })
    // Catch block for empty hash
    .then((session) => {
      console.log('session', session);
      if (session) {
        //authenticate user
      } else {
        //that means user is not valid. do something with .tap()???
      }
    });
  // // //.tap
  // // Catch block for invalid session
  //




  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

