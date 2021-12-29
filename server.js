//IMPORTACIÓN DE PAQUETES NECESARIOS
const express = require('express');
const mongodb = require('mongodb');
require("dotenv").config()

//INICIALIZAMOS EL SERVIDOR
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//INICALIZAMOS LA BBDD
let MongoClient = mongodb.MongoClient;
MongoClient.connect( process.env.URL_MONGO, function(err, client){
    if(err!=null) {vo
        console.log(err);
        console.log("🔴 MongoDB no conectado");
    } 
    else {
        app.locals.db= client.db("proyectoM2");
        console.log("🟢 MongoDB conectado");
    }});

//INICIALIZAMOS CAMPO DE LOGIN PARA USO POSTERIOR
app.locals.sesion={"logged":false, "username":""}

//IMPORTAMOS LOS ROUTER DE ALUMNOS Y ASIGNATURAS
let alumnos=require('./alumnos');
let asignaturas=require('./asignaturas');

app.use('/alumnos',alumnos);
app.use('/asignaturas',asignaturas);

//ESTABLECEMOS EL PUERTO DE CONEXIÓN
app.listen(process.env.PORT || 3002);