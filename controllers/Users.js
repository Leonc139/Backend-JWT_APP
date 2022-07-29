import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      // opsi data yang ditampilkan
      attributes: ["id", "name", "email"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
  }
};

export const getUsersById = async (req, res) => {
  try {
    const users = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async (req, res) => {
  try {
    // data diambil dari body
    await Users.create(req.body);
    res.status(201).json({ msg: "User Created" });
  } catch (error) {
    console.log(error);
  }
};
export const updateUser = async (req, res) => {
  try {
    await Users.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "User Updated" });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    await Users.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "User Deleted" });
  } catch (error) {
    console.log(error.message);
  }
};

export const Register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password dan Confirm Password tidak cocok" });
  // salt = random string
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    // create digunakan karena akan disimpan didatabase
    await Users.create({
      name: name,
      email: email,
      password: hashPassword,
    });
    res.json({ msg: "Register Berhasil" });
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res) => {
  try {
    // mencari user berdasarkan email
    const user = await Users.findAll({
      where: {
        email: req.body.email,
      },
    });
    // membandingkan password yang dikirimkan dari client dengan yang ada didatabase
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({ msg: "Wrong Password" });
    // jika password cocok
    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;
    // membuat akses token
    const accessToken = jwt.sign(
      // payload
      { userId, name, email },
      // secret key
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    // membuat refresh token
    const refreshToken = jwt.sign(
      // payload
      { userId, name, email },
      // secret key
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    // menyimpan refresh token ke database
    await Users.update(
      // field: variabel("refreshToken")
      { refresh_token: refreshToken },
      {
        // mengupdate berdasarkan id
        where: {
          id: userId,
        },
      }
    );
    // membuat httpOnly cookie yang akan dikirimkan ke client
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // expired cookie
      maxAge: 24 * 60 * 60 * 1000,
    });
    // mengirimkan respon ke client akses tokennya
    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({ msg: "Email tidak ditemukan" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  // jika dapat token, maka akan dibandingkan(cek) tokennya dengan token didatabase
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  // mengambil id, [0] karena single data
  const userId = user[0].id;
  // update refresh token didatabase & set menjadi null
  await Users.update(
    { refresh_token: null },
    {
      // update berdasarkan id
      where: {
        id: userId,
      },
    }
  );
  // jika token yang terdapat didatabase di set menjadi null kemudian akan dihapus cookienya
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};
