import bcrypt from "bcryptjs";

const testPassword = "TestPassword123!";

console.log("Testing password hashing...\n");

// Simulate registration process
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(testPassword, salt);

console.log("Original password:", testPassword);
console.log("Hashed password:", hashedPassword);
console.log("Hash length:", hashedPassword.length);
console.log();

// Simulate login process
const isMatch1 = await bcrypt.compare(testPassword, hashedPassword);
console.log("✓ Direct comparison:", isMatch1);

// Test with wrong password
const wrongPassword = "WrongPassword123!";
const isMatch2 = await bcrypt.compare(wrongPassword, hashedPassword);
console.log("✗ Wrong password comparison:", isMatch2);

// Test re-hashing (this would be wrong)
const doubleHashed = await bcrypt.hash(hashedPassword, 10);
const isMatch3 = await bcrypt.compare(testPassword, doubleHashed);
console.log("✗ Double-hashed comparison:", isMatch3);

console.log("\nIf password is being double-hashed, login will fail.");
