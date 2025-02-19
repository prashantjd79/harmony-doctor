const bcrypt = require("bcryptjs");

const newPassword = "0000000"; // The password you're trying

async function testHash() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("Newly Hashed Password:", hashedPassword);

    // Manually compare with the stored hash from MongoDB
    const storedHash = "$2a$10$y5gr2oO7bjQ92Bw3hO/ggOyCHd8b9rf5Y3E9SLAIrDM.tnTqqxwdq"; // From MongoDB
    const isMatch = await bcrypt.compare(newPassword, storedHash);
    console.log("Password Matches Stored Hash:", isMatch);
}

testHash();
