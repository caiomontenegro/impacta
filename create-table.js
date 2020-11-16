// Solicita o pacote MySQL.
const mysql = require ('mysql');

// Objeto com as informações do DB.
const connection = mysql.createConnection({
    host: 'us-cdbr-east-02.cleardb.com',
    port: 3306,
    user: 'b3800a28a347af',
    password: '31e69231',
    database: 'heroku_61e55eadc73519c',
})

// Função que da conexão com o BD.
connection.connect(function(err){
    if(err) {
        return console.log(err);
    } else {
    console.log('conectado');
    createtable(connection);
    addRows(connection);
    }
})

// Função para criar tabela no DB
function createtable(conn) {

    const sql = "CREATE TABLE IF NOT EXISTS Users ("+
                "ID int NOT NULL AUTO_INCREMENT,"+
                "Name varchar(150) NOT NULL,"+
                "User varchar (150) NOT NULL,"+
                "Password varchar(20) NOT NULL,"+
                "Job varchar(20) NOT NULL,"+
                "PRIMARY KEY (ID)"+
                ");";

    conn.query (sql, function(err, results, fields){
        if(err) return console.log(err);
        console.log('criou a tabela');
    })
}

// Função para popular tablea no DB.
function addRows(conn){
    const sql = "INSERT INTO Users(Name, User, Password, Job) VALUES ?";
    const values = [
        ['Caio Montenegro', 'caio', '1234', 'user'],
        ['Cleberton Junior', 'junior', '4321', 'admin']
    ];
    conn.query(sql, [values], function(error, results, fields){
        if(error) return console.log(error);
        console.log('Usuários cadastrados');
        conn.end();
    })

}