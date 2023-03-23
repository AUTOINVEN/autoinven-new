const throwUnauthorizedError = (next) => {
  const error = new Error('Unauthorized Error');
  error.statusCode = 403;
  next(error);
};

const authorize = (req, next, type) => {
  // 웹 요청 인가
  console.log("++++++++++++1");
  if (req.session.role) {
    console.log("++++++++++++2");
    if (req.session.role === type) {
      next();
    } else {
      throwUnauthorizedError(next);
    }
  }

  // 앱 요청 인가
  else if (req.user) {
    console.log("++++++++++++3");
    if (req.user.role === type) {
      next();
    } else {
      throwUnauthorizedError(next);
    }
  }

  // 인가 실패
  else {
    console.log("++++++++++++4");
    throwUnauthorizedError(next);
  }
};

exports.authorizeAdmin = (req, res, next) => {
  authorize(req, next, 'admin');
};

exports.authorizeUser = (req, res, next) => {
  authorize(req, next, 'user');
};
