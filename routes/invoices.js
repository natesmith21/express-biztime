
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * from invoices`);
        return res.json({invoices: results.rows})
    } catch (e){
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try{
        let {id} = req.params;
        const results = await db.query(`SELECT * from invoices WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`cannot find invoice ${id}`, 404)
        }
        return res.json({invoice: results.rows[0]})
    } catch (e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]})
    } catch (e) {
        return next(e)
    }
})


router.patch('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        let amt = req.body.amt;
        let paid = req.body.paid;
        let results;
        if (amt){
            results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *', [amt, id])
        } if (paid === true){
            results = await db.query('UPDATE invoices SET paid=$1, paid_date=CURRENT_DATE WHERE id=$2 RETURNING *', [paid, id])
        } if (paid === false){
            results = await db.query('UPDATE invoices set paid=$1, paid_date=$3 WHERE id=$2 RETURNING *', [paid, id, null]) 
        }
        if (results.rows.length === 0){
            throw new ExpressError(`cannot find invoice ${id}`, 404);
        }
        return res.json({invoice: results.rows[0]})
    } catch (e) {
        next(e)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query('DELETE FROM invoices WHERE id=$1', [id])
        return res.json({msg: `${id} deleted`})
    } catch (e) {
        next(e)
    }
})

module.exports = router;

