//ROUTER ALUMNOS
const { application } = require('express');
const express = require('express');
const router = express.Router();
const bcrypt =require("bcrypt"); //módulo para encriptar las contraseñas

//ruta de registro del usuario en la colección alumnos 
router.post("/registro", function(req,res){
    req.app.locals.db
    .collection("alumnos")
    //comprobación si el user o dni ya están registrados 
    .find({$or:[{dni:req.body.dni},{user:req.body.user}]})
    .toArray(function(err,datos){
        if(err){
            res.send({
                error:true,
                data:err,
                mensaje:"Consulta fallida a la BBDD"
            })
        }
        else{
            if(datos.length>0){
                res.send({
                    error:true,
                    data:err,
                    mensaje:"El dni o nombre de usuario ya existe"
                    })
            }
            else{
                //encriptación de la contraseña registrada por el user
                req.body.contraseña=  bcrypt.hashSync( req.body.contraseña,10 );
                req.app.locals.db
                .collection("alumnos")
                .insertOne(req.body,function(err2,datos2){
                    if(err2){
                        res.send({
                            error:true,
                            data:err2,
                            mensaje:"Inserción fallida en la BBDD"
                        })
                    }
                    else(
                        res.send({
                            error:false,
                            data:datos2,
                            mensaje:"Registro realizado con éxito"
                        })
                    )
                })
            }
        }
    })
})

//muestra los datos del user registrado en la colección alumnos
router.get("/mostrar", function(req,res){
    req.app.locals.db 
    .collection("alumnos")
    //busca en la bbdd el alumno logeado
    .find({user:req.app.locals.sesion.username})
    .toArray(function(err,datos){
        if(err){
            res.send({
                error:true,
                data:err,
                mensaje:"Consulta fallida a la BBDD"
            })
        }
        else{
            if(datos.length==0){
                res.send({
                    error:true,
                    data:err,
                    mensaje:"No hay ningún usuario registrado con ese DNI"
                    })
            }
            else{
                res.send({
                    error:false,
                    data:datos,
                    mensaje:"Búsqueda realizada con éxito"
                })
            }
        }
    })
})

//borra el usuario de la colección alumnos
router.delete("/borrar", function(req,res){
    req.app.locals.db 
    .collection("alumnos")
    .deleteOne({user:req.app.locals.sesion.username},
    function(err,datos){
        if(err){
            res.send({
                error:true,
                data:err,
                mensaje:"Consulta fallida a la BBDD"
            })
        }
        else{
            if(datos.deletedCount==0){
                res.send({
                    error:true,
                    data:err,
                    mensaje:"No hay ningún usuario registrado con ese DNI"
                    })
            }
            else{
                req.app.locals.sesion={"logged":false, "username":""}
                //si el delete es correcto, cerramos la sesión del user y se elimina
                res.send({
                    error:false,
                    data:datos,
                    mensaje:"Usuario borrado con éxito"
                })
            }
        }
    })
})

//modifica datos del usuario de la colección alumnos
router.put("/modificar", function(req,res){
    if(req.body.contraseña){
        //si modifica la contraseña, encripta la nueva
        req.body.contraseña = bcrypt.hashSync( req.body.contraseña,10 );
    }
    req.app.locals.db 
    .collection("alumnos")
    .updateOne({user:req.app.locals.sesion.username},{$set:req.body},
    function(err,datos){
        if(err){
            res.send({
                error:true,
                data:err,
                mensaje:"Consulta fallida a la BBDD"
            })
        }
        else{
            if(datos.modifiedCount==0){
                res.send({
                    error:true,
                    data:err,
                    mensaje:"No se ha realizado ningún cambio en los datos del usuario"
                    })
            }
            else{
                res.send({
                    error:false,
                    data:datos,
                    mensaje:"Campo/s modificado/s con éxito"
                })
            }
        }
    })
})

//inicia sesión con datos user y psw que ya están guardados en la colección alumnos
router.post("/login",function(req, res) { 
    let username = req.body.user; 
    let password = req.body.contraseña; 
    req.app.locals.db.collection("alumnos") 
    .find({ user: username }) 
    .toArray(function(err, arrayUsuario) { 
        if(err !=null) { 
            res.send({
                error:true,
                datos: err,
                mensaje:"Ha habido un error"
            }); 
        }
        else{ 
            if(arrayUsuario.length > 0) {
                //compraramos la contraseña que ha introducido el usuario con la guardada(encriptada) en la BBDD
                if(bcrypt.compareSync(password,  arrayUsuario[0].contraseña)){ 
                    req.app.locals.sesion={"logged":true, "username":arrayUsuario[0].user}
                    //si el usuario se logea con éxito, guardamos en el servidor la sesión para que permanezca "on line" hasta que cierre sesión
                    res.send({
                        error:false, 
                        mensaje:"Logueado correctamente"}); 
                }
                else{ 
                    res.send({ 
                        error:true,
                        mensaje:"Contraseña incorrecta"
                    }); 
                } 
            }
            else{ 
                res.send({ 
                    error:true,
                    mensaje:"El usuario no existe"
                }); 
            } 
        } }); });

//cierra la sesión iniciada
router.delete("/log-out", function(req,res){
    req.app.locals.sesion={"logged":false, "username":""}
    res.send({
        error:false, 
        mensaje:"Sesión cerrada correctamente"}); 
        })
module.exports=router;
            