
const sucursalAccess = (req, res, next) => {
    const usuario = req.usuario; 

    if (!usuario) {
        return res.status(401).json({ msg: 'Acceso denegado. No autenticado.' });
    }

    const { rol, sucursal_id } = usuario;


    if (rol === 'admin' || rol === 'operaciones') {
        req.filtroSucursal = {}; 
        return next();
    }

    if (rol === 'gerente') {
        if (!sucursal_id) {
            console.error(`Gerente ${usuario.id} no tiene sucursal asignada.`);
            return res.status(403).json({ 
                msg: 'Acceso denegado. Su sucursal no está asignada.' 
            });
        }
        
        req.filtroSucursal = { sucursal: sucursal_id }; 
        return next();
    }

    return res.status(403).json({ msg: 'Acceso denegado. Rol no autorizado para esta acción.' });
};

module.exports = sucursalAccess;