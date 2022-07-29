import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // mengambil header
  const authHeader = req.headers["authorization"];
  // mengambil token
  // ini artinya jika user tidak mengirimkan token maka variabel token kosong
  // namun jika user mengirimkan token maka akan di split dan diambil tokennya
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  // jika dapet token maka akan diverifikasi
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.email = decoded.email;
    next();
  });
};
