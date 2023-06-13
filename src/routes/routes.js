const express = require('express');
const { body } = require('express-validator');
const excelDB = require('../controllers/excelDB');
const pacienteDB = require('../controllers/pacienteDB');
const turnoDB = require('../controllers/turnoBD');
const terapistaDB = require('../controllers/terapistaDB');
const funcionesGeneralesDB = require('../controllers/funcionesGeneralesDB');
const controller = require('../controllers/controller');
const { authenticacionToken, authenticacionRolPaciente, authenticacionRolTerapista, authenticacionAdmin, noRolPaciente } = require('../middlewares/authenticacion');



const router = express();
const date = new Date();


//////////////////
// Rutas de Sesion
//////////////////
router.post('/singUp/', [
        body('id_usuario', 'Ingrese un ID de USUARIO válido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric(),

       body('password', 'Ingrese una contraseña de mínimo 8 carácteres')
        .trim()
        .isLength({min: 8})
        .escape(),
    ],
    controller.singUp);

router.post('/login/', [

        body('id_usuario', 'Ingrese un ID de USUARIO válido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric(),

        body('password', 'Ingrese una contraseña de mínimo 8 carácteres')
        .trim()
        .isLength({min: 8})
        .escape(),
    ],
    controller.logIn);

router.delete('/delUsuario/', authenticacionToken, authenticacionRolPaciente, [
    body('id_usuario', 'Ingrese un ID de USUARIO válido..')
    .trim()
    .notEmpty()
    .escape()
    .isNumeric(),

    body('password', 'Ingrese una contraseña de mínimo 8 carácteres')
    .trim()
    .isLength({min: 8})
    .escape(),

    ],
    controller.delUser);

///////////////
// Ruta General
///////////////
router.get('/getAll/', authenticacionToken, authenticacionAdmin, [
        body('tabla', 'Ingrese un nombre de TABLA válido..')
        .trim()
        .notEmpty()
        .escape()
        .isString(),
    ],
    funcionesGeneralesDB.getAllGeneral);

////////////
// PACIENTES
////////////
router.get('/getPaciente/', authenticacionToken, [
    body('dni', 'Ingrese un DNI valido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric()
    ],
    pacienteDB.getPaciente);

router.post('/postPaciente/', authenticacionToken, noRolPaciente, [

        body('dni', 'Ingrese un DNI valido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric(),
    
        body('nombre', 'Ingrese un NOMBRE válido..')
        .trim()
        .notEmpty()
        .escape()
        .isString(),

        body('email', 'Ingrese un EMAIL válido..')
        .trim()
        .isEmail()
        .normalizeEmail(),

        body('patologia', 'Ingrese una PATOLOGIA valida..')
        .trim()
        .notEmpty()
        .escape()
        .isString(),
    ],
    pacienteDB.postPaciente);

router.put('/putPaciente/', authenticacionToken , authenticacionRolPaciente, [
    
    body('dni', 'Ingrese un DNI válido..')
    .trim()
    .notEmpty()
    .escape(),

    body('email', 'Ingrese un EMAIL válido.')
    .trim()
    .isEmail()
    .normalizeEmail(),  
    ],
    pacienteDB.putPaciente);

router.delete('/delPaciente/', authenticacionToken, authenticacionAdmin, [
    
        body('dni', 'Ingrese un DNI válido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric(),
 
    ], 
    pacienteDB.delPaciente);

// PACIENTES FUNCIONA CORRECTAMENTE //

/////////
// TURNOS
/////////
router.get('/getTurno/', authenticacionToken, [
    body('id_turno', 'Ingrese un ID de TURNO valido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric()
    ],
    turnoDB.getTurno);

router.post('/postTurno/', authenticacionToken, authenticacionRolPaciente, [
        body('id_terapista', "Ingrese un ID de TERAPISTA valido..")
        .trim()
        .notEmpty()
        .escape()
        .isNumeric(),
        
        body("dni_paciente", "Ingrese un DNI de PACIENTE valido..")
        .trim()
        .notEmpty()
        .isNumeric()
        .escape(),

        body("fecha", "Ingrese una FECHA valida (dd-mm-yyyy)..")
        .trim()
        .notEmpty()
        .isString()
        .isLength({min: 10, max: 11})
        .custom((fecha) =>{
            
            value = fecha.split("-");
            for(i = 0; i< value.length; i++){
                parseInt(value[i], 10);
                
                switch(i){
                    
                    case 0:
                        if(value[i] < 1 || value[i] > 31) throw new Error('Dia ingresado invalido..');
                    break;

                    case 1:
                        
                        if(value[i] < 1 || value[i] > 12) throw new Error('Mes ingresado invalido..');
                    break;

                    case 2:
                        if(value[i] < date.getUTCFullYear() || value[i] > 2100) throw new Error('Año ingresado invalido..');
                    break;
                }   
            }
            return fecha;
        }),

        body("desde", "Ingrese un horario de inicio valido (HH:MM)..")
        .trim()
        .notEmpty()
        .isLength(5)
        .isString()
        .custom((desde) =>{
            value = desde.split(":")
            for(i = 0; i< value.length; i++){
                parseInt(value[i], 10);
                switch(i){
                    case 0:
                        if(value[i] < 0 || value[i] > 23) throw new Error('Hora ingresada invalida..');
                    break;

                    case 1:
                        if(value[i] < 0 || value[i] > 59) throw new Error('Minutos ingresados invalidos..')
                    break;
                }   
            }
            return desde;
        }),

       


    ],
    turnoDB.postTurno);

router.put('/putTurno/', authenticacionToken, authenticacionRolPaciente, [
    body('id_turno', "Ingrese un ID de TURNO valido..")
    .trim()
    .notEmpty()
    .escape()
    .isNumeric(),

    body("fecha", "Ingrese una FECHA valida (dd-mm-yyyy)..")
    .trim()
    .notEmpty()
    .isLength(10)
    .isString()
    .escape()
    .custom((fecha) =>{
        
        value = fecha.split("-")
        
        for(i = 0; i<this.length(value); i++){
            switch(i){
                case 0:
                    if(value[i] < 1 || value[i] > 31) throw new Error('Dia ingresado invalido..');
                break;

                case 1:
                    if(value[i] < 1 || value[i] > 12) throw new Error('Mes ingresado invalido..')
                break;

                case 2:
                    if(value[i] < Date.date.getUTCFullYear() || value[i] > 2100) throw new Error('Año ingresado invalido..')
                break;
            }  
            return fecha;
        }
    }),

    ],
    turnoDB.putTurno);

router.delete('/delTurno/', authenticacionToken, authenticacionAdmin, [
    body('id_turno', 'Ingrese un ID de TURNO valido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric()
    ],
    turnoDB.delTurno);

router.put('/cancelarTurno/', authenticacionToken, authenticacionRolPaciente, [
    body("id_usuario", "Ingrese un DNI de PACIENTE valido..")
    .trim()
    .notEmpty()
    .isNumeric()
    .escape(),

    body("id_turno", "Ingrese un ID de TURNO valido..")
    .trim()
    .notEmpty()
    .isNumeric()
    .escape(),
    ],
    turnoDB.cancelarTurno);


router.get('/getTurnosEnSemana/', authenticacionToken, [
    body('id', "Ingrese un id valido..")
    .trim()
    .notEmpty()
    .escape()
    .isNumeric(),
    ],
    turnoDB.getTurnosEnSemana);
// TURNO FUNCIONA CORRECTAMENTE


/////////////
// TERAPISTAS
/////////////
router.get('/getTerapista/', authenticacionToken, authenticacionRolTerapista, [
        body('id_terapista', 'Ingrese un ID de TERAPISTA valido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric()
    ],
    terapistaDB.getTerapista);

router.post('/postTerapista/', authenticacionToken, authenticacionAdmin, [
    body('id_terapista', 'Ingrese un ID de TERAPISTA valido..')
    .trim()
    .notEmpty()
    .escape()
    .isNumeric(),

    body('nombre', 'Ingrese un NOMBRE valido..')
    .trim()
    .notEmpty()
    .escape()
    .isString(),

    body('turno', 'Ingrese un TURNO valido..')
    .trim()
    .notEmpty()
    .escape()
    .isString()
    .custom((value) =>{
        var cont = 0;
        
        if(value !== "Mañana") cont++;
        
        if(value !== "Tarde") cont++;
        
        if(value !== "Noche") cont++;
        
        if(cont == 3) throw new Error('Ingrese un TURNO valido (Mañana, Tarde o Noche)..')
        
        return value;
        
    }),
    ],

    terapistaDB.postTerapista);

router.put('/putTerapista/', authenticacionToken, authenticacionRolTerapista, [
    body('id_terapista', 'Ingrese un ID de TERAPISTA valido..')
    .trim()
    .notEmpty()
    .escape()
    .isNumeric(),

    body('turno', 'Ingrese un turno valido (Mañana, Tarde o Noche)..')
    .trim()
    .notEmpty()
    .escape()
    .isString()
    .custom((value, req) =>{
        var cont = 0;
        
        if(value !== "Mañana") cont++;
        
        if(value !== "Tarde") cont++;
        
        if(value !== "Noche") cont++;
        
        if(cont == 3) throw new Error('Ingrese un TURNO valido (Mañana, Tarde o Noche)..')
        
        return value;
        
    }),
    ],
    terapistaDB.putTerapista);

router.delete('/delTerapista/', authenticacionToken, authenticacionAdmin, [
    body('id_terapista', 'Ingrese un ID de TERAPISTA valido..')
    .trim()
    .notEmpty()
    .escape()
    .isNumeric()
    ],
    terapistaDB.delTerapista);

// TERAPISTAS FUNCIONA CORRECTAMENTE //

/////////////////
// DESCARGA EXCEL
/////////////////
router.get('/getExcel/', authenticacionToken, authenticacionRolPaciente, [
        body('id_usuario', 'Ingrese un DNI valido..')
        .trim()
        .notEmpty()
        .escape()
        .isNumeric(),
    ],
    excelDB.getExcel);

module.exports = router;