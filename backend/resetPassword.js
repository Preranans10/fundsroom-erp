const bcrypt = require("bcryptjs");
const { Client } = require("pg");

async function reset() {
    const client = new Client({
        host: "localhost",
        port: 5432,
        database: "fundsroom_erp",
        user: "postgres",
        password: "prerana@123"
    });

    await client.connect();

    const newPassword = "Admin@123";

    const hash = await bcrypt.hash(newPassword, 10);

    await client.query(
        "UPDATE users SET password = $1 WHERE email = $2",
        [hash, "admin@fundsroom.com"]
    );

    console.log("PASSWORD RESET SUCCESSFULLY");

    await client.end();
}

reset().catch(console.error);