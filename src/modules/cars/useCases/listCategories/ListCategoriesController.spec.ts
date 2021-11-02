import { app } from '@shared/infra/http/app';
import { hash } from 'bcryptjs';
import request from "supertest";
import { Connection, createConnection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection
describe("List category controller", () => {

    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const id = uuidV4();
        const password = await hash("admin", 8);

        await connection.query(
            `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driverslicense)
                values('${id}', 'admin', 'admin@rentx.com', '${password}', true, 'now()', 'ABC-123')
            `
        );
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    })

    it("should be able to list all categories", async () => {
        const responseToken = await request(app).post("/sessions")
            .send({
                email: 'admin@rentx.com',
                password:  'admin'
            });

            const { token } = responseToken.body;

        await request(app).post("/categories")
        .send({
            name: "Categort test",
            description: "description test"
        })
        .set({
            Authorization: `Bearer ${token}`
        });

        const response = await request(app).get("/categories");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toEqual("Categort test");
    });
})