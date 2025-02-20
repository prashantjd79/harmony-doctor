const bcrypt = require("bcryptjs");

const inputPassword = "1234567"; // Use the password you entered in reset

async function hashAndCompare() {
    const salt = await bcrypt.genSalt(10);
    const newlyHashedPassword = await bcrypt.hash(inputPassword, salt);
    console.log("Newly Hashed Password:", newlyHashedPassword);

    // Compare with stored hash from MongoDB
    const storedHashedPassword = "$2a$10$Vh5KNwmdUaBGqAXNQAfcWeX.7sZ2zH4JOzP/770P15kIq9Y6qlJI6"; // Use your stored MongoDB hash
    const isMatch = await bcrypt.compare(inputPassword, storedHashedPassword);
    console.log("Password Matches Stored Hash:", isMatch);
}

hashAndCompare();
