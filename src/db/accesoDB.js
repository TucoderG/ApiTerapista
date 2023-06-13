const oracle = require('oracledb');

require('dotenv').config(options = {path: '.env'});

const connection = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionString: process.env.CONNECTIONSTRING,
    port: process.env.PORT,
    trustServerCertificate: true,
    stream: true,
}


async function getConnection(){
    try{
        const pool = await oracle.getConnection(connection);
        return pool;
    }catch(error){
        console.log(error.message);
    }
}

async function closeConnection(pool){
    
    pool.close((err) =>{
        if(err) throw new Error('Error al finalizar la conexion...');
    }); 
    

}

async function commitPool(pool){

    pool.commit((err) => {
        if (err) throw new Error(err.message);  
    });
    
}

module.exports = {
    getConnection,
    closeConnection,
    commitPool,
}