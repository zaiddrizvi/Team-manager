import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role = 'member' } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('Email already exists');
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ user: userResponse(user), token: generateToken(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({ user: userResponse(user), token: generateToken(user) });
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  res.json({ user: userResponse(req.user) });
};
