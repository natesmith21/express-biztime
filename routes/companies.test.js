process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const newCompany = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('yeti', 'Yeti Coolers', 'wildly stronger')
        RETURNING code, name, description`);
    testCompany = newCompany.rows[0];
    const newInvoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('yeti', 200) RETURNING id, comp_code, amt, paid`);
    testCompany.invoices = newInvoice.rows;
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe('get /companies', () => {
    test('get list of companies', async () => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200);
        // expect(res.body).toEqual({companies: [testCompany]})
        expect(res.body).toEqual({companies: [
            {"code": testCompany.code,
                "name": testCompany.name,
                "description": testCompany.description
            }
        ]})
    })
    test('get a single company', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: testCompany})
    })
    test("Responds with 404 for invalid company code", async () => {
        const res = await request(app).get(`/compaines/trek`)
        expect(res.statusCode).toBe(404);
      })
})

describe('POST /companies', () => {
    test('creates a single company', async () => {
        const res = await request(app).post('/companies').send({code: 'newco', name: 'New Company', description: 'A very real new venture'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: {code: 'newco', name: 'New Company', description: 'A very real new venture'}
        })
    })
})

describe('PATCH /companies/:code', () => {
    test('updates a single company', async () => {
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({name: 'Yeti', description: 'more than just coolers'});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {code: 'yeti', name: 'Yeti',description: 'more than just coolers'}
        })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).patch(`/compaines/trek`).send({ name: 'Trek', description: 'we make bikes'});
        expect(res.statusCode).toBe(404);
      })
})

describe('DELETE /companies/:code', () => {
    test('deletes a single company', async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: `${testCompany.code} deleted`})
    })
})

