process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;
beforeEach(async () => {
    const newCompany = db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('yeti', 'Yeti Coolers', 'wildly stronger')
        RETURNING code, name, description`);
    const newInvoice = db.query(
        `INSERT INTO invoices (comp_code, amt) VALUES ('yeti', 200) RETURNING *`);
    const queries = await Promise.all([newCompany, newInvoice]);    
        testCompany = queries[0].rows[0];
        testCompany.invoices = queries[1].rows[0-3];
        testInvoice = queries[1].rows[0];
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe('get /invoices', () => {
    test('get list of invoices', async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoices:[{
            "id": testInvoice.id,
			"comp_code": testInvoice.comp_code,
			"amt": testInvoice.amt,
			"paid": false,
			"add_date": expect.anything(),
			"paid_date": null
        } ]})
    })
    test('get a single invoice', async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: {
            "id": testInvoice.id,
			"comp_code": testInvoice.comp_code,
			"amt": testInvoice.amt,
			"paid": false,
			"add_date": expect.anything(),
			"paid_date": null
        }})
    })
    test("Responds with 404 for invalid invoice id", async () => {
        const res = await request(app).get(`/invoices/0`)
        expect(res.statusCode).toBe(404);
      })
})

describe('POST /invoices', () => {
    test('creates a single invoice', async () => {
        const res = await request(app).post('/invoices').send({comp_code: `${testCompany.code}`, amt: 1234567});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {
                "id": expect.any(Number),
                "comp_code": testCompany.code,
                "amt": 1234567,
                "paid": false,
                "add_date": expect.anything(),
                "paid_date": null
            }
        })
    })
})

describe('PATCH /invoices/:id', () => {
    test('updates a single invoice', async () => {
        const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({amt: 800});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                "id": testInvoice.id,
                "comp_code": testInvoice.comp_code,
                "amt": 800,
                "paid": false,
                "add_date": expect.anything(),
                "paid_date": null
            } 
        })
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).patch(`/invoices/0`).send({ amt: 900000 });
        expect(res.statusCode).toBe(404);
      })
})

describe('DELETE /invoices/:id', () => {
    test('deletes a single invoice', async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: `${testInvoice.id} deleted`})
    })
})

