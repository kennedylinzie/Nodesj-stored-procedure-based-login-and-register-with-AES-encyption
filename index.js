import { registerUser, loginUser, rotateKey } from './auth.js';

// Register a new user
//await registerUser("newuser", "password123", 1);

// Log in a user
//await loginUser("newuser", "password123");

// Rotate keys old ,new ,newVersion
await rotateKey("newMasterKey", "thatssssssssssss", 3);