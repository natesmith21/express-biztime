
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

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
        const results = await db.query(`SELECT * from companies WHERE code = $1`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`cannot find company ${code}`, 404)
        }
        return res.json({company: results.rows[0]})
    } catch (e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {code, name, description} = req.body;
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

