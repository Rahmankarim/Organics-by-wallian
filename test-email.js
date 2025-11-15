// Quick email test script
const { sendVerificationCodeEmail } = require("./lib/email.ts");

async function testEmail() {
  console.log("Testing email configuration...");

  // Test with a dummy email and code
  const testEmail = "test@example.com";
  const testCode = "123456";

  const result = await sendVerificationCodeEmail(testEmail, testCode);

  console.log("Email test result:", result ? "SUCCESS" : "FAILED");
}

testEmail().catch(console.error);
