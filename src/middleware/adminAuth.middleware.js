const jwt = require("jsonwebtoken");
const { TOKEN_TYPE } = require("../constants/roles");

/*
==========================================
Admin Auth Middleware
Verifies the JWT was issued to an admin (type: "admin"),
keeping admin sessions isolated from regular user sessions.
==========================================
*/

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== TOKEN_TYPE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access only",
      });
    }

    req.admin = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};
