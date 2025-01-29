const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const makeSlug = require("../middleware")

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * from companies`);
        return res.json({companies: results.rows})
    } catch (e){
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try{
        let {code} = req.params;
        const queries = await Promise.all([db.query(`SELECT * from companies WHERE code = $1`, [code]),
        db.query(`SELECT id, comp_code, amt, paid from invoices WHERE comp_code = $1`, [code]) 
    ])
        if (queries[0].rows.length === 0) {
            throw new ExpressError(`cannot find company ${code}`, 404)
        }
        let company = queries[0].rows[0];
        company.invoices = queries[1].rows;
        return res.json({company})
    } catch (e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {name, description} = req.body;
        const code = makeSlug(name);
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]})
    } catch (e) {
        return next(e)
    }
})


router.patch('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const {name, description} = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *', [name, description, code])
        if (results.rows.length === 0){
            throw new ExpressError(`cannot find company ${code}`, 404);
        }
        return res.json({company: results.rows[0]})
    } catch (e) {
        next(e)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const results = await db.query('DELETE FROM companies WHERE code=$1', [code])
        return res.json({msg: `${code} deleted`})
    } catch (e) {
        next(e)
    }
})

module.exports = router;

