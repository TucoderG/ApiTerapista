# Tecnologías a utilizar

Gestor de versiones: Git 
Repositorio de código: GitHub
Editor de código: Visual Studio Code.
Lenguaje de programación: JavaScript
Entorno de compilación de código: Node.js
Framework: Express 
Plataforma API: Postman
Base de datos: Oracle
Entorno de desarrollo para base de datos: SQL Developer

# Librerías

Oracledb: Conexión a la base de datos y el entorno de desarrollo SQL Developer
Bcrypt: Encriptación de contraseñas para mayor seguridad.
Excel4node: Creación y descarga de archivo Excel.

# Middleware

Body-parser: Sirve para agregar al request un body de acuerdo al header
Express-validator: Validación de datos recibidos en el body del request.
JWT: Sesion de usuario y authenticación para restringir el acceso de algunas rutas.



# Idea de desarrollo
Tengo pensado crear una API REST, la cual contará con una base de datos Oracle la cual manejará los datos del sistema de manera relacional ya que existen relaciones en los requisitos del sistema como lo serían los turnos hacia los pacientes y terapistas, además resulta más eficiente la búsqueda de un turno en caso de querer ser cancelado o modificado como cualquier otro dato. 
Tanto para la conexión a la base de datos, como para otras cosas necesarias en caso de haberlas, utilizare variables de entorno en un archivo .env.
Este software abordará la seguridad (utilizando algunas librerías y middlewares mencionados) en cuanto a, las sesiones de pacientes, terapistas o un rol superior, como de los datos de entrada al sistema para intentar evitar la manipulación maliciosa de los datos almacenados en la base de datos. 
La API estará construida de manera modular, es decir, mantendré separada cada parte que conforme este software en grupos como, por ejemplo, rutas, controladores, middlewares, funciones, base de datos, etc.
Para ver los datos obtenidos por las distintas rutas utilizaré Postman en un servidor local con las rutas y los métodos correspondientes para las acciones CRUD (limitadas según el tipo de usuario que esté queriendo acceder). 

Los Roles que van a existir serán: Terapista, Paciente, Administrador.
El Rol Administrador (Único), tendrá acceso a todas las acciones.
El Rol Paciente (Lo creará un Terapista o Administrador), podrá manejar la creación, modificación o eliminación de turnos y ver su historial de citas. 
El Rol Terapista (Lo crea el usuario Administrador) podrá ver el historial de sus turnos (en general o por paciente), modificar o cancelar turnos y cambiar de horario de atención.


# End Points

 General
 
  - /getAll/            Requiere: nombre de la tabla, Authenticación y Rol de administrador.

 Sesion
 
  - /singUp/            Requiere: ID de usuario y password.
  - /logIn/             Requiere: ID de usuario y password.
  - /delUser/           Requiere: Authenticación y Rol de paciente.

 Pacientes
 
  - /getPaciente/        Requiere: DNI del paciente y Authenticación.
  - /postPaciente/       Requiere: Datos del paciente, Authenticación y Rol que no sea paciente.
  - /putPaciente/        Requiere: DNI del paciente, email para actualizar, Authenticación y Rol de paciente.
  - /delPaciente/        Requiere: DNI del paciente, Authenticación y Rol de admin.
 
 Turnos
  
  - /getTurno/           Requiere: ID del turno y Authenticación 
  - /postTurno/          Requiere: ID del turno y del terapista, DNI del paciente, fecha del dia, hora de comienzo, Authenticación y Rol de paciente.
  - /putTurno/           Requiere: ID del turno y fecha a modificar, Authenticación y Rol de paciente.
  - /delTurno/           Requiere: ID del turno, Authenticación y Rol de administrador.
  - /cancelarTurno/      Requiere: ID del turno, DNI del paciente, Authenticación y Rol de paciente.
  - /getTurnosEmSemama/  Requiere: DNI del paciente y Authenticación.
 
 
 Terapistas
  
  - /getTerapista/       Requiere: ID del terapista, Authenticación y Rol de terapista.
  - /postTerapista/      Requiere: Datos del terapista, Authenticación y Rol de administrador.
  - /putTerapista/       Requiere: ID del terapista y turno o email a modificar, Authenticación y Rol de terapista.
  - /delTerapista/       Requiere: ID del terapista, Authenticación y Rol de administrador.

 Historial
 
  - /getExcel/           Requiere: DNI del paciente, Authenticación y Rol de paciente.

