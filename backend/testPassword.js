const bcrypt = require("bcryptjs");
const { Client } = require("pg");

async function test() {
    const client = new Client({
        host: "localhost",
        port: 5432,
        database: "fundsroom_erp",
        user: "postgres",
        password: "prerana@123"
    });

    await client.connect();

    const result = await client.query(
        "SELECT password FROM users WHERE email = $1",
        ["admin@fundsroom.com"]
    );

    const hash = result.rows[0].password;

    const match = await bcrypt.compare("Admin@123", hash);

    console.log("Password matches:", match);

    await client.end();
}

test().catch(console.error);