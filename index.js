
//Solicitação de pacotes externos.
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const sinespApi = require('sinesp-api');
const moment = require('moment');

function execSQLQuery(sqlQry, res){
    const connection = mysql.createConnection({
        host: 'sql10.freesqldatabase.com',
        port: 3306,
        user: 'sql10375663',
        password: 'Gy7rcApiTc',
        database: 'sql10375663',
    })

    connection.query(sqlQry, function(error, results, fields){
        if(error) {
            res.json(error);
        } else {
            res.json(results);
            connection.end();
        }
    })
}

function execSQLQuerySaida(sqlQry, res, bandeira){
    const connection = mysql.createConnection({
        host: 'sql10.freesqldatabase.com',
        port: 3306,
        user: 'sql10375663',
        password: 'Gy7rcApiTc',
        database: 'sql10375663',
    })

    connection.query(sqlQry, function(error, results, fields){
        if(error) {
            res.json(error);
        } else {
            res.json({price: bandeira*results[0].hora.substring(0,2)})
            connection.end();
        }
    })
}

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const router = express.Router();
router.get('/', (req, res) => {
    res.json({message: 'Funcionando'})
});

router.get('/users', (req, res) => {
    execSQLQuery('SELECT * FROM Users', res);
})

router.get('/buscaVeic/:placa?', async (req, res) => {
    let vehicle = await sinespApi.search(`${req.params.placa}`);
    infoVeic = {"modelo": `${vehicle["modelo"]}`, "cor": `${vehicle["cor"]}`};
    await res.json(infoVeic);
})

router.get('/users/:id?', (req, res) => {
    let filter = '';
    if(req.params.id) filter = ' WHERE ID=' + parseInt(req.params.id);
    execSQLQuery('SELECT * FROM Users' + filter, res);
})

router.delete('/users/delete/:id', (req, res) => {
    execSQLQuery('DELETE FROM Users WHERE ID=' + parseInt(req.params.id), res);
    console.log('Usuário deletado');
})

router.post('/users/include', (req, res) => {
    const name = req.body.name;
    const user = req.body.user;
    const password = req.body.password;
    const job = req.body.job;
    execSQLQuery(`INSERT INTO Users(Name, User, Password, Job) VALUES('${name}','${user}','${password}','${job}')`, res);
    console.log('Usuário cadastrado.')
});

router.patch('/users/update/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.body.name;
    const user = req.body.user;
    const password = req.body.password;
    const job = req.body.job;
    execSQLQuery(`UPDATE Users SET Name='${name}', User='${user}',Password='${password}',Job='${job}' WHERE ID=${id}`, res);
    console.log('Usuário atualizado.');
});

router.get('/vagas', (req, res) => {
    execSQLQuery('SELECT * FROM vagas', res);
})

router.get('/vagas/:id?', (req, res) => {
    let filter = `select v.placa, v.modelo, v.cor, a.entrada
                    from alocacao a
                    join veiculo v on v.id_veiculo = a.Veiculo_id_veiculo 
                    join vagas v2 on a.Vagas_id_vagas = v2.id_vagas
                    where a.Vagas_id_vagas = ${parseInt(req.params.id)}
                    order by a.entrada desc
                    limit 1;`
    execSQLQuery(filter, res);
});

router.get('/vagas/fechamento/:id?', (req, res) => {
    let bandeira = req.query.bandeira;
    let entrada =  `SELECT TIMEDIFF(current_timestamp, entrada) AS 'hora'  FROM alocacao WHERE Vagas_id_vagas= ${parseInt(req.params.id)}`
    let hora = execSQLQuerySaida(entrada, res, bandeira);
})

router.get('/veiculos', (req, res) => {
    execSQLQuery('SELECT * FROM veiculo', res);
})
 
router.post('/veiculo/cadastra/', (req, res) => {
    const placa = req.body.placa;
    const modelo = req.body.modelo;
    const cor = req.body.cor;
    execSQLQuery(`INSERT INTO veiculo(placa, modelo, cor) VALUES('${placa}','${modelo}','${cor}')`, res);
    console.log('Veículo Cadastrado.')
});

router.post('/alocacao/cadastra/', (req, res) => {
    const entrada = req.body.entrada;
    const veiculo_id_veiculo = req.body.veiculo_id_veiculo;
    const vagas_id_vagas = req.body.vagas_id_vagas;
    const usuarios_id_usuarios = req.body.usuarios_id_usuarios;
    execSQLQuery(`INSERT INTO alocacao(entrada, Veiculo_id_veiculo, Vagas_id_vagas, Usuarios_id_usuarios) VALUES('${entrada}','${veiculo_id_veiculo}','${vagas_id_vagas}','${usuarios_id_usuarios}')`, res);
    console.log('Veículo Cadastrado.')
});

router.patch('/vagas/update/:status?/:id?/', (req, res) => {
    const id = parseInt(req.params.id);
    const status = req.params.status;
    let bandeira = 0;
    var data = new Date();
    if (08 <= data.getHours() <= 17) {
        bandeira = 1;
    } else {
        bandeira = 2;
    }
    if (status == 'livre') {
        execSQLQuery(`UPDATE vagas SET status='livre' WHERE id_vagas=${id}`, res);
        console.log('Usuário atualizado.');
    } else if (status == 'ocupado') {
        execSQLQuery(`UPDATE vagas SET status='ocupado', Preco_id_preco = ${bandeira} WHERE id_vagas=${id}`, res);
        console.log('Usuário atualizado.');
    } else if (status == 'bloqueado') {
        execSQLQuery(`UPDATE vagas SET status='bloqueado' WHERE id_vagas=${id}`, res);
        console.log('Usuário atualizado.');
    } else {
        res.send('Status incorreto!')
        console.log('Status incorreto!');
    }
});

router.patch('/preco/update/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const valor = req.body.valor;
    execSQLQuery(`UPDATE preco SET valor='${valor}' WHERE id_preco = ${id}`, res);
    console.log('Usuário atualizado.');
});

app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));
app.use('/', router);
console.log('API Conectada')

