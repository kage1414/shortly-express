const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const cookieParser = require('./middleware/cookieParser');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'), { redirect: false }));

app.use(cookieParser);
app.use(Auth.createSession);

app.get('/', Auth.verifySession, (req, res) => {
  res.render('index');
});

app.get('/create', Auth.verifySession, (req, res) => {
  res.render('index');
});

app.get('/links', (req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', (req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/login', (req, res, next) => {
  return models.Users.get({username: req.body.username})
    .then((results) => {
      if (!results) {
        throw new Error('User does not exist');
      }
      return models.Users.compare(req.body.password, results.password, results.salt);
    })
    .then((bool) => {
      if (!bool) {
        throw new Error('Incorrect Password');
      }
      let username = req.body.username;
      return models.Users.get({username})
        .then((results) => {
          req.session.userId = results.insertId;
          let options = {hash: req.session.hash};
          let values = {userId: results.insertId};
          models.Sessions.update(options, values);
        });
    })
    .then((results) => {
      res.redirect('/');
    })
    .error((err) => {
      console.log('error: ', err);
    })
    .catch((err) => {
      res.redirect('/login');
    });
});

app.post('/signup', (req, res, next) => {
  return models.Users.get({username: req.body.username})
    .then((results) => {
      if (results) {
        throw results;
      }
      //create new user and save to db
      var username = req.body.username;
      var password = req.body.password;
      return models.Users.create({username, password})
        .then((results) => {
          req.session.userId = results.insertId;
          let options = {hash: req.session.hash};
          let values = {userId: results.insertId};
          models.Sessions.update(options, values);
        });
      // If user already exists
      // Throw error to catch block

    })
    .then(() => {
      res.redirect('/');
    })
    .catch(() => {
      // Redirect, user should choose different username
      res.redirect('/signup');
    });
});

app.get('/logout', (req, res, next) => {
  let id = req.session.userId;
  let hash = req.session.hash;
  models.Sessions.delete({id, hash})
    .then((result) => {
      console.log('Deleted');
    })
    .catch((err) => {
      console.log('Error: ', err);
    });
  next();
});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
