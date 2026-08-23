const HealthModel = require('../models/HealthModel');

const HealthController = {
    async verificarSaude(req, res) {
        try {
            const linha = await HealthModel.verificarBanco();

            return res.status(200).json({
                status: 'ok',
                banco: 'conectado',
                produtos: Number(linha.total)
            });
        } catch (erro) {
            console.error('Health check falhou:', erro);

            return res.status(503).json({
                status: 'indisponivel',
                banco: 'sem resposta',
                mensagem: 'O banco de dados não respondeu.'
            });
        }
    }
};

module.exports = HealthController;
