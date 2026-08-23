const db = require('../config/db');

const HealthModel = {
    async verificarBanco() {
        return db.buscarUm('SELECT COUNT(*)::integer AS total FROM produtos');
    }
};

module.exports = HealthModel;
