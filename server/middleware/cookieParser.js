const parseCookies = (req, res, next) => {
  console.log('parsecookies', req);
  if (req.headers.cookie) {
    let cookie = {};
    let splitCookies = req.headers.cookie.split('; ');
    splitCookies.forEach((idx) => {
      let tuple = idx.split('=');
      cookie[tuple[0]] = tuple[1];
    });
    req.cookies = cookie;
    // console.log('cookie', cookie);
  }
  next();
};

module.exports = parseCookies;