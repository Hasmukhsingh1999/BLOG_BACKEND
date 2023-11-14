import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Use !token for a more accurate check
  if (!token) {
    return res.status(401).json({ error: 'No access token' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || !user) {
      return res.status(403).json({ error: 'Access token is invalid' });
    }
    req.user = user.id;
    next();
  });
};