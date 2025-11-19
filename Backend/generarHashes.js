// generarHashes.js
const bcrypt = require('bcryptjs');

// La contraseña que quieres usar para todos tus usuarios (¡cámbiala por una tuya!)
const passwordPlana = 'password';

// El "costo" del hash (qué tan complejo es)
const saltRounds = 10;

bcrypt.hash(passwordPlana, saltRounds, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Tu contraseña plana es:', passwordPlana);
    console.log('Tu HASH SEGURO (para la BD) es:', hash);
});