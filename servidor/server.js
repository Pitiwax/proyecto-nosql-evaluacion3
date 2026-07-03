require('dotenv').config();
const express = require('express'); // Librería que permite generar servidores JS
const cors = require('cors'); // Permite la ejecución de scripts entre máquinas distintas (cliente - servidor)
const mongoose = require('mongoose'); // ORM para trabajar con express (Object Relatonal Mapping)
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas
const dns = require("node:dns/promises");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

dns.setServers(["1.1.1.1"]);

const uri = process.env.URI

// Crear la conexion con MongoDB
mongoose.connect(uri)
    .then(() => console.log('Conexión Exitosa!'))
    .catch((err) => console.error('Error al conectar a la DB: ', err));

// Chequeamos el puerto en el que efectivamente está corriendo la app
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const direccion = new mongoose.Schema({
    comuna: String,
    calle: String,
    numero: String,
    departamento: String
});

// Creamos la ENTIDAD/MODELO en mongoose (ORM)
const usuario = new mongoose.Schema({
    nombre: { type: String, required: true },
    rut: { type: String, required: true },
    email: { type: String, required: true },
    telefono: String,
    fechaNacimiento: Date,
    contrasena: { type: String, required: true },
    nacionalidad: { type: String, required: true },
    genero: String,
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    direccion: [direccion],
    activo: { type: Boolean, default: true }
});


const pais = new mongoose.Schema({
    nombre: String,
    nacionalidad: String,
    iso_2: String
})

// Creamos el OBJETO en mongoose, usando el MODELO como patrón/base
const Usuario = mongoose.model('Usuario', usuario, 'usuarios');

const Pais = mongoose.model('Pais', pais, 'paises');
// Creamos Schema para empleos
const empleo = new mongoose.Schema({
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    empresa: { type: String, required: true },
    cargo: { type: String, required: true },
    fechaIngreso: Date,
    salario: Number,
    modalidad: String, 
    estado: String    
});

// Creamos el modelo Empleo para la coleccion
const Empleo = mongoose.model('Empleo', empleo, 'empleos');


// Crear el ENDPOINT para recibir los datos de usuario
app.post('/guardarUsuario', async (req, res) => {
    try {
        // Leemos la data desde el BODY (cuerpo) de la REQUEST (solicitud)
        // Agregué acá al final telefono y genero para recibirlos desde el formulario
        const { nombre, rut, email, fechaNacimiento, contrasena, nacionalidad, direccion, telefono, genero } = req.body;
        const direccionUsuario = JSON.parse(direccion);

        const salt = bcrypt.genSaltSync(10);
        const contrasenaEncriptada = bcrypt.hashSync(contrasena, salt);
        // Instanciamos el OBJETO Usuario con los valores obtenidos desde la REQUEST
        const nuevoUsuario = new Usuario({ nombre, rut, email, fechaNacimiento, contrasena: contrasenaEncriptada, nacionalidad, direccion: direccionUsuario, telefono, genero });

        // Le indicamos al ORM que debe PERSISTIR ese OBJETO
        await nuevoUsuario.save();
        res.status(200).json({ message: 'Datos Guardados correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar los datos: ', err });
    }
});


// Crear el ENDPOINT para leer los datos de usuario
app.get('/obtenerUsuarios', async (req, res) => {
    try {
        // Obtenemos una lista de usuarios desde DB
        const usuarios = await Usuario.aggregate([{ // Colección principal desde la que queremos obtener datos
            $lookup: {
                from: 'paises', // Colección que contiene los datos que queremos agregar
                localField: 'nacionalidad', // Campo de la colección principal que tiene la data relacionada
                foreignField: 'iso2', // Campo en la colección agregada que tiene el dato real
                as: 'paisOrigen' // Alias o nombre que le daremos a la agregación
            }
        }]);

        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los datos: ', err });
    }
});

// Crear el ENDPOINT para leer los datos de paises
app.get('/obtenerPaises', async (req, res) => {
    try {
        // Obtenemos una lista de paises desde DB
        const paises = await Pais.find();
        res.status(200).json(paises);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los datos: ', err });
    }
});
// Endpoint para guardar los datos de un empleo
app.post('/guardarEmpleo', async (req, res) => {
    try {
        const { usuario, empresa, cargo, fechaIngreso, salario, modalidad, estado } = req.body;
        const nuevoEmpleo = new Empleo({ usuario, empresa, cargo, fechaIngreso, salario, modalidad, estado });

        await nuevoEmpleo.save();
        res.status(200).json({ message: 'Empleo guardado con éxito.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar el empleo: ', err });
    }
});
// Endpoint para leer los empleos cruzados con los usuarios
app.get('/obtenerEmpleos', async (req, res) => {
    try {        
        const listaEmpleos = await Empleo.aggregate([
            {
                $lookup: {
                    from: 'usuarios',         
                    localField: 'usuario',     
                    foreignField: '_id',       
                    as: 'datosUsuario'         
                }
            }
        ]);
        res.status(200).json(listaEmpleos);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los empleos: ', err });
    }
});
