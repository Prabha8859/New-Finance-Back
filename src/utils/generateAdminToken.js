const jwt = require("jsonwebtoken");
const { TOKEN_TYPE } = require("../constants/roles");

const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      type: TOKEN_TYPE.ADMIN,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = generateAdminToken;
