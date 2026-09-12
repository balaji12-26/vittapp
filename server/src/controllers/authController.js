import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.exists({ email });
  if (existing) {
    throw ApiError.conflict(
      'EMAIL_TAKEN',
      'An account with that email already exists. Sign in instead.',
      [{ field: 'email', message: 'Already registered' }]
    );
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message and roughly the same work either way, so the response does
  // not reveal which email addresses have accounts.
  const ok = user ? await user.verifyPassword(password) : false;
  if (!user || !ok) {
    throw ApiError.unauthorized('That email and password do not match.');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
