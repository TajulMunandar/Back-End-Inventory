import { query } from "../database/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Invalid Data" });
  }
  next();
};

const actionLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM User WHERE email = ?";
    const [user] = await query(sql, [email]);
    if (!user) {
      return res.json({ Login: false });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.json({ Login: false });
    }

    const data = {
      id: user.id_user,
      email: user.email,
      is_admin: user.is_admin,
    };

    const token = jwt.sign(data, "12321kamsda-123nasda-12", {
      expiresIn: "1d",
    });
    res.cookie("token", token);
    res.json({
      Login: true,
      email: user.email,
      is_admin: user.is_admin,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const actionLogout = (req, res) => {
  res.clearCookie("token").json({ valid: false });
};

export { validateLogin, actionLogin, actionLogout };
