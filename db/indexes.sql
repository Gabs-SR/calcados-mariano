-- Índices usados pelas consultas públicas da vitrine.

CREATE INDEX IF NOT EXISTS idx_produtos_numeracao
    ON produtos (numeracao);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria
    ON produtos (categoria);

CREATE INDEX IF NOT EXISTS idx_produtos_publico
    ON produtos (publico);

CREATE INDEX IF NOT EXISTS idx_produtos_publico_categoria
    ON produtos (publico, categoria);

CREATE INDEX IF NOT EXISTS idx_produtos_nome_ordenacao
    ON produtos (nome_ordenacao, id);
