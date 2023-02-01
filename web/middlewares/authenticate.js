const checkClientType = require('$base/utils/checkClientType');

// 웹 인증
const authenticateWeb = (session) => {
  if (session.role) {
    return true;
  } else {
    return false;
  }
};

// 앱 인증
const authenticateApp = (token) => {
  const jwt = require('jsonwebtoken');
  const secret_key = process.env.JWT_SECRET_KEY;

  try {
    return jwt.verify(token, secret_key);
  } catch (err) {
    return null;
  }
};

const throwUnauthenticatedError = (next) => {
  const error = new Error('Unauthenticated Error');
  error.statusCode = 401;
  next(error);
};

const throwInvalidTokenError = (next) => {
  const error = new Error('Invalid Token');
  error.statusCode = 406;
  next(error);
};

module.exports = (req, res, next) => {
  const request_type = checkClientType(req.headers['user-agent']);
  console.log('request_type',request_type)
  // 웹 요청
  if (request_type === 'web') {
    // 인증 성공
    if (authenticateWeb(req.session)) {
      res.locals.role = req.session.role;
      console.log("res.locals.role",res.locals.role)
      next();
    } else {
      throwUnauthenticatedError(next);
    }
  }

  // 앱 요청
  else if (request_type === 'app') {
    const user_info = authenticateApp(req.headers.token);
    if (user_info) {
      req.user = user_info;
      next();
    } else {
      throwInvalidTokenError(next);
    }
  }
};
