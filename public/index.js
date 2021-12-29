//registro de la cuenta de usuario en la bbdd
function registrarUsuario(){
    let nombreR= document.getElementById("nombreR").value;
    let apellido1R= document.getElementById("apellido1R").value;
    let apellido2R= document.getElementById("apellido2R").value;
    let fechaNacimientoR= document.getElementById("fechaNacimientoR").value;
    let dniR= document.getElementById("dniR").value;
    let nombreUserR= document.getElementById("nombreUserR").value.toLowerCase();
    let contraseñaR= document.getElementById("contraseñaR").value;
    let correoR= document.getElementById("correoR").value;
    let numR= document.getElementById("numR").value;
    let alumno={"nombre":nombreR,"apellido1":apellido1R,"apellido2":apellido2R,"fechaNacimiento":fechaNacimientoR,"dni":dniR,"user":nombreUserR,"contraseña":contraseñaR,"correo":correoR,"numTelf":numR}

    if(nombreR==""|| apellido1R==""||fechaNacimientoR==""||dniR==""||nombreUserR==""||contraseñaR==""||correoR==""){
        document.getElementById("errorForm").innerHTML="No se ha podido realizar el registro, por favor, rellena todos los campos obligatorios"
    }//comprueba si algunos de los campos obligatorios está vacío
    else{
        fetch("/alumnos/registro",{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(alumno)
        }).then((res)=>res.json())
        .then((datos)=>{
            document.getElementById("mainRegistro").innerHTML=datos.mensaje
            setTimeout(function(){ location.href="./iniciosesion.html"; }, 1500);
            //cuando el user se registra al 1,5 s se redirige al inicio de sesión
        })
    }
}

//inicia sesión de usuario ya registrado si el user y contraseña coinciden
function logUser(){
    let user=document.getElementById("userL").value.toLowerCase()
    let contraseña=document.getElementById("pswL").value
    let credenciales={"user":user,"contraseña":contraseña}
    fetch("/alumnos/login",{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credenciales)
    }).then((res)=>res.json())
    .then((datos)=>{
        if(datos.error){
            document.getElementById("errorLogin").innerHTML=datos.mensaje
        }else{
            document.getElementById("errorLogin").innerHTML=datos.mensaje
            location.href = "./home.html";
            //cuando inicia sesión se redirige a la pantalla "home"
            mostrarPerfil()
        }
    })
}

//cierra sesión de usuario 
function cerrarSesion(){
    fetch("/alumnos/log-out",{
        method:"DELETE",
        headers:{
            "Content-Type": "application/json"
        },
    }).then((res)=>res.json())
    .then((datos)=>{
        //document.getElementById("datosUsuario").innerHTML=datos.mensaje
        location.href = "./index.html";
        //cuando cierra sesión se redirige a la pantalla "index"
    })
}

//muestra el perfil del usuario que está guardado en la BBDD, colección alumnos
function mostrarPerfil(){
    
    fetch("/alumnos/mostrar",{
        method: "GET",
        headers:{
            "Content-Type": "application/json"
        },
    }).then((res)=>res.json())
    .then((datos)=>{
        if(datos.error){
            document.getElementById("datosUsuario").innerHTML=datos.mensaje
        }else{
            document.getElementById("datosUsuario").innerHTML=`
            <ul>
            <li><b>DATOS PERSONALES</b></li><br>
            <li>${datos.data[0].nombre}</li>
            <li>${datos.data[0].apellido1}</li>
            <li>${datos.data[0].apellido2}</li>
            <li>${datos.data[0].fechaNacimiento}</li><br>
            <li><b>DATOS DE CONTACTO</b></li><br>
            <li>${datos.data[0].correo}</li>
            <li>${datos.data[0].numTelf}</li></ul>`
        }
    })
}

//modifica perfil de algunos campos guardados en la BBDD (correo, telf y conrtaseña)
function modificarPerfil(){
    let modificacion = {}//comprobamos los campos no vacíos para modificar solo esos
    if(document.getElementById("correoMod").value!=""){
        modificacion.correo=document.getElementById("correoMod").value
    }
    if(document.getElementById("numMod").value!=""){
        modificacion.numTelf=document.getElementById("numMod").value
    }
    if(document.getElementById("passwordMod").value!=""){
        modificacion.contraseña=document.getElementById("passwordMod").value
    }
    fetch("/alumnos/modificar",{
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(modificacion)
    }).then((res)=>res.json())
    .then((datos)=>{
        document.getElementById("mensajeMod").innerHTML=`<p>${datos.mensaje}</p>`
        document.getElementById("correoMod").value="";
        document.getElementById("numMod").value="";
        document.getElementById("passwordMod").value="";
        //una vez modificado uno o varios campos se resetea el input para que aparezca vacío
    })
    setTimeout(function(){ mostrarPerfil(); }, 100);
    //muestra los cambios modificados cuando clicka en el botón "modificar" tras 100 ms 
}

//elimina el perfil del usuario, con la condición  de que no esté matriculado a ninguna asignatura
function eliminarPerfil(){
    fetch("/asignaturas/mostrar-user",{
        method: "GET",
        headers:{
            "Content-Type": "application/json"
        },
    }).then((res)=>res.json())
    .then((datos)=>{
        if(datos.data.length>0){//comprobamos si el user está matriculado de alguna asignatura
            document.getElementById("mensajeElim").innerHTML=`(*)Para poder borrar el usuario, has de desmatricularte primero de todas las asignaturas.`;
        }else{
            fetch("/alumnos/borrar",{
                method: "DELETE",
                headers:{
                    "Content-Type": "application/json"
                },
            }).then((res)=>res.json())
            .then((datos)=>{
        
                document.getElementById("mainPerfil").innerHTML=`<p>${datos.mensaje}</p>`
            })
            setTimeout(function(){ location.href="./index.html" }, 1500);
            //tras eliminar el usuario al 1'5s redirige a la página "index"
        }
    })
}

//muestra todas las asignaturas dadas de alta en la BBDD
function mostrarAsignaturas(){
    fetch("/asignaturas/mostrar",{
        method: "GET",
        headers:{
            "Content-Type": "application/json"
        },
    }).then((res)=>res.json())
    .then((datos)=>{
        if(datos.error){
            document.getElementById("tablonAsignaturas").innerHTML=datos.mensaje;
        }else{
            for(let i=0;i<datos.data.length;i++){
                templateCard(i, datos.data[i],"tablonAsignaturas");
                if(datos.logged){
                    document.getElementById(i).innerHTML+=` <a onclick="matricularse('${datos.data[i].codigo}','${datos.user}',${i})">Matricúlate</a><div id=mensajeBotonMatricula${i}></div>`;
                   //botón para poder matricularse de las asignaturas
                }
            }
        }
    })
}

//crea las tarjetas de las asignaturas
function templateCard(id, objeto,tablon){
    document.getElementById(tablon).innerHTML+="<div class=card id="+id+"></div>";
    document.getElementById(id).innerHTML+=`<img src=${objeto.img} alt="imagen">`;
    document.getElementById(id).innerHTML+="<h3>"+objeto.nombre+"</h3>";
    document.getElementById(id).innerHTML+="<p> "+objeto.descripcion+"</p>";
    //document.getElementById(id).innerHTML+="<p><b>Docencia:</b> "+objeto.docencia+"</p>";
}

//se realiza la matriculación del user a una asignatura
function matricularse(codigo,user,id){
    fetch("/asignaturas/matricularse",{
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"codigo":codigo,"user":user})
    }).then((res)=>res.json())
    .then((datos)=>{
        document.getElementById(`mensajeBotonMatricula${id}`).innerHTML=`<p>${datos.mensaje}</p>`
    })
}

//se realiza la desmatriculación del user a una asignatura
function desmatricularse(codigo,user,id){
    fetch("/asignaturas/desmatricularse",{
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"codigo":codigo,"user":user})
    }).then((res)=>res.json())
    .then((datos)=>{
        document.getElementById(id).innerHTML=`<p>${datos.mensaje}</p>`
    })
}

//muestra las asignaturas que el user está matriculado
function mostrarAsignaturasMatricula(){
    fetch("/asignaturas/mostrar-user",{
        method: "GET",
        headers:{
            "Content-Type": "application/json"
        },
    }).then((res)=>res.json())
    .then((datos)=>{
        if(datos.error){
            document.getElementById("tablonMatriculadas").outerHTML=`<div id=noMatricula>
            <h1>${datos.mensaje}</h1>
            <p>Para matricularte<a href="./matricula.html"> pincha aquí</a></p>
            </div>`;// si no está matriculado de ninguna le aparece esta información
        }else{
            for(let i=0;i<datos.data.length;i++){
                templateCard(i, datos.data[i],"tablonMatriculadas");
                if(datos.logged){
                    document.getElementById(i).innerHTML+=`<a onclick="desmatricularse('${datos.data[i].codigo}','${datos.user}',${i})">Desmatricúlate</a>`;
                    //una vez el user está matriculado de una asignatura se puede desmatricular
                }
            }
        }
    })
}