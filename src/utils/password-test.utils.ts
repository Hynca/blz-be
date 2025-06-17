import bcrypt from "bcrypt";

/**
 * Utility function to test bcrypt password hashing and comparison
 */
export const testBcrypt = async (plainPassword: string): Promise<void> => {
  try {
    console.log("=== BCRYPT TEST ===");
    console.log("Plain password:", plainPassword);

    // Generate hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    console.log("Generated hash:", hashedPassword);

    // Test comparison with correct password
    const correctComparison = await bcrypt.compare(
      plainPassword,
      hashedPassword
    );
    console.log("Correct password comparison result:", correctComparison);

    // Test comparison with wrong password
    const wrongComparison = await bcrypt.compare(
      "wrongpassword",
      hashedPassword
    );
    console.log("Wrong password comparison result:", wrongComparison);

    console.log("=== END TEST ===");
  } catch (error) {
    console.error("Error in bcrypt test:", error);
  }
};
