const { getHistPaciente } = require("./pacienteDB");
const { create_archive } = require("../tools/excel");
const { validacionEntrada } = require('../controllers/funcionesGeneralesDB');
const path = require('path');
const em = require('../errors/messages');

const getExcel = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);

    const date = new Date();
    const dia = date.getUTCDate();
    const mes = (date.getUTCMonth()) + 1;
    const anio = date.getUTCFullYear();

    const dni = req.body.id_usuario;
    const titulos = ["nro_turno", "nro_terapista", "fecha", "desde", "asistencia"];

    try{
        if(message !== "") throw new Error(message);
        
        const historialPaciente = await getHistPaciente(dni);

        let nombreArchivo = `${dni}_${dia}_${mes}_${anio}`;

        const pathExcel = path.join(__dirname, '../', 'excel', nombreArchivo + '.xlsx');
        console.log(pathExcel);

        //CREO EL ARCHIVO
        create_archive(nombreArchivo, titulos, historialPaciente, pathExcel);
        
        
        return res.status(200).json({status: 'succes', msg: `Excel Descargado...`});
        
    }catch(err){
        if(err.message.includes("Ingrese")){
            return res.status(409).json({"status": 'error', error: err.message});
        }
        return res.status(404).json({status: 'error', error: err.message});
    }
       
}



module.exports = {

    getExcel,
    
}