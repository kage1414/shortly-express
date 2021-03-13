const parseCookies = (req, res, next) => {
  if (req.headers.cookie) {
    let cookie = {};
    let splitCookies = req.headers.cookie.split('; ');
    splitCookies.forEach((idx) => {
      let tuple = idx.split('=');
      cookie[tuple[0]] = tuple[1];
    });
    req.cookies = cookie;
  } else {
    req.cookies = {};
  }
  next();
};

module.exports = parseCookies;