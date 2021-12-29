//ROUTER ASIGNATURAS
const { application } = require('express');
const express = require('express');
const router = express.Router();

//muestra todas las asignaturas guardadas en la BBDD
router.get("/mostrar", function(req,res){
    req.app.locals.db 
    .collection("asignaturas")
    .find()
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
                    mensaje:"No hay ninguna asignatura"
                    })
            }
            else{
                res.send({
                    error:false,
                    data:datos,
                    mensaje:"Búsqueda realizada con éxito",
                    logged: req.app.locals.sesion.logged,
                    user:req.app.locals.sesion.username
                })
            }
        }
    })
})

//permite al user matricularse de cualquier asignatura
router.put("/matricularse",function(req,res){
    req.app.locals.db
    .collection("asignaturas")
    //hace una búsqueda por código de asignatura en la bbdd
    .find({"codigo":req.body.codigo})
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
                    mensaje:"Esta asignatura no está registrada"
                    })
            }
            else{
                req.app.locals.db
                .collection("asignaturas")
                //busca por user y código de asignatura para comprobar si el user ya estaba matriculado
                .find({$and:[{"alumnos":req.body.user},{"codigo":req.body.codigo}]})
                .toArray(function(err2,datos2){
                    if(err2){
                        res.send({
                            error:true,
                            data:err2,
                            mensaje:"Consulta fallida a la BBDD"
                        })
                    }
                    else{
                        if(datos2.length>0){
                            res.send({
                                error:true,
                                data:datos2,
                                mensaje:"Ya estás matriculada/o en esta asignatura",
                            })
                        }
                        else{
                            //se matricula al user de la asignatura, añadimos el user en el array alumnos de la colección asignatura
                            datos[0].alumnos.push(req.body.user)
                            req.app.locals.db
                            .collection("asignaturas")
                            .updateOne({"codigo":req.body.codigo},{$set:datos[0]},
                            function(err3,datos3){
                                if(err3){
                                    res.send({
                                        error:true,
                                        data:err3,
                                        mensaje:"Consulta fallida a la BBDD"
                                    })
                                }
                                else{
                                    res.send({
                                        error:false,
                                        data:datos3,
                                        mensaje:"Matrícula realizada con éxito."
                                    })
                                }
                            })
                        }
                    }  
                })
            } 
        }
    })
})

//muestra las asignaturas que el user está matriculado
router.get("/mostrar-user", function(req,res){
    req.app.locals.db 
    .collection("asignaturas")
    .find({"alumnos":req.app.locals.sesion.username})
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
                    data:[],
                    mensaje:"Todavía no te has matriculado de ninguna asignatura"
                    })
            }
            else{
                res.send({
                    error:false,
                    data:datos,
                    mensaje:"Búsqueda realizada con éxito",
                    logged: req.app.locals.sesion.logged,
                    user:req.app.locals.sesion.username
                })
            }
        }
    })
})

//una vez el user está matriculado de una asignatura, permite desmatricularse
router.put("/desmatricularse",function(req,res){
    req.app.locals.db
    .collection("asignaturas")
    .find({"codigo":req.body.codigo})
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
                    mensaje:"Esta asignatura no está registrada"
                    })
            }
            else{
                req.app.locals.db
                .collection("asignaturas")
                .find({$and:[{"alumnos":req.body.user},{"codigo":req.body.codigo}]})
                .toArray(function(err2,datos2){
                    if(err2){
                        res.send({
                            error:true,
                            data:err2,
                            mensaje:"Consulta fallida a la BBDD"
                        })
                    }
                    else{
                        if(datos2.length==0){
                            res.send({
                                error:true,
                                data:datos2,
                                mensaje:"No estás matriculada/o en esta asignatura",
                            })
                        }
                        else{
                            //procedemos a desmatricular al user eliminando al user del campo alumnos de la colección asignaturas
                            let userBorrar=datos[0].alumnos.indexOf(req.body.user)
                            datos[0].alumnos.splice(userBorrar,1)
                            req.app.locals.db
                            .collection("asignaturas")
                            .updateOne({"codigo":req.body.codigo},{$set:datos[0]},
                            function(err3,datos3){
                                if(err3){
                                    res.send({
                                        error:true,
                                        data:err3,
                                        mensaje:"Consulta fallida a la BBDD"
                                    })
                                }
                                else{
                                    res.send({
                                        error:false,
                                        data:datos3,
                                        mensaje:"Te has desmatriculado de la asignatura correctamente"
                                    })
                                }
                            })
                        }
                    }  
                })
            } 
        }
    })
})

module.exports = router;


