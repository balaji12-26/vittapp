import { z } from 'zod';
import { ROLES } from '../models/User.js';

const email = z
  .string({ required_error: 'Enter your email address.' })
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address.')
  .email('That email address looks incomplete.');

const password = z
  .string({ required_error: 'Choose a password.' })
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Keep it under 128 characters.');

export const signupSchema = z.object({
  name: z
    .string({ required_error: 'Enter your name.' })
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(80, 'Keep it under 80 characters.'),
  email,
  password,
  role: z
    .enum(ROLES, { errorMap: () => ({ message: 'Choose attendee or organizer.' }) })
    .default('attendee'),
});

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Enter your password.' }).min(1, 'Enter your password.'),
});
