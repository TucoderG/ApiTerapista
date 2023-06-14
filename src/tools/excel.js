const excel = require('excel4node');
const fs = require('fs');
const em = require('../errors/messages');

  
function create_archive(nombreArchivo, data_set_title, data_set_body, pathExcel){  

    var wb = new excel.Workbook({
        defaultFont: {
            size: 11,
            name: 'Arial',
            color: 'FFFFFFFF',
            
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
        },
        dateFormat: 'm/d/yy hh:mm:ss',

    });

    var titColum = wb.createStyle({
        font:{
            name: 'Arial',
            color: '000000',
            size: 12,
            bold: true,
            
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
        },
        dateFormat: 'm/d/yy hh:mm:ss',

    });
    
    var contFila = wb.createStyle({
        font: {
            name: 'Arial',
            color: '000000',
            size: 10,
            
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
        },
        dateFormat: 'm/d/yy hh:mm:ss',

    });

    var ws = wb.addWorksheet(nombreArchivo);

    
    i = 1;
    

    data_set_title.forEach(title => {
        
        ws.column(i).setWidth(title.length*1.7);
        ws.cell(1,i).string(title.toUpperCase()).style(titColum);  
        i++;  

    });

    pos = 1
    fila = 2
    data_set_body.forEach(row => {
        for(pos = 1; pos < i; pos++){
            ws.cell(fila,pos).string(row[pos-1].toString()).style(contFila);
        }
        fila++;
    });
    

    wb.write(pathExcel, (err) => {
        
        if(err) throw new Error("Error al escribir el archivo.");

        console.log('Archivo descargado en el sistema.');

        // En el caso de Web
        //funcion para eliminar el archivo
        // fs.rm(pathExcel, (err) =>{
        //     if(err) throw new Error("Error al eliminar el archivo..");
        // });
        //console.log("Archivo elimidado del sistema.")
        
    });
    
            
    //return pathExcel;
}


module.exports = {
    create_archive,
}