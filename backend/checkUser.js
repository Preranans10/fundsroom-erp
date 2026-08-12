const { Client } = require("pg");

async function checkUser() {
    const client = new Client({
        host: "localhost",
        port: 5432,
        database: "fundsroom_erp",
        user: "postgres",
        password: "prerana@123"
    });

    try {
        await client.connect();

        const result = await client.query(
            "SELECT id, name, email, role, password FROM users WHERE email = $1",
            ["admin@fundsroom.com"]
        );

        console.log(result.rows);
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

checkUser();