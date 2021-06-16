import express from 'express';
import cors from 'cors';
import pg from 'pg';
import joi from 'joi';

const app = express();
app.use(express.json());
app.use(cors());


const { Pool } = pg;

const connection = new Pool ({
    "host": "localhost",
    "port": 5432,
    "database": "pratica_gerenciador_financeiro_9560838b",
    "user": "bootcamp_role",
    "password": "senha_super_hiper_ultra_secreta_do_role_do_bootcamp"
})

app.get('/api/finances', (req, res) => {

    const order = req.query.order || 'created_at';

    const query = connection.query('SELECT * FROM financial_events ORDER BY '+ order +' DESC');
    query.then(result => {
        res.send(result.rows)
    })
})

app.post('/api/finances', async (req,res) => {

    const schema = joi.object({
        value: joi.number(),
        description: joi.string().required(),
        event_type: joi.string().valid("revenue", "expense").required()

    })
    const isValid = schema.validate(req.body);

    if(isValid.error) return res.sendStatus(422);

    const {value, description, event_type} = req.body;
    try {
    const data = await connection.query('INSERT INTO financial_events (value, description, event_type, created_at) VALUES ($1, $2, $3, $4)', 
        [value, description, event_type, new Date().toISOString()])

    res.sendStatus(200)
    }
    catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

app.listen(4000);