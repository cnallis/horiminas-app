-- Criação do banco de dados
CREATE DATABASE horominas;

-- Conectar ao banco de dados
\c horominas;

-- Criação da tabela de motoristas
CREATE TABLE motoristas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE, -- CPF ou CNPJ
    senha VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de rendimentos
CREATE TABLE rendimentos (
    id SERIAL PRIMARY KEY,
    motorista_id INTEGER REFERENCES motoristas(id) ON DELETE CASCADE,
    mes INTEGER NOT NULL, -- 1-12 representando o mês
    ano INTEGER NOT NULL,
    total_entregas INTEGER NOT NULL,
    toneladas DECIMAL(10, 2) NOT NULL,
    valor_bruto DECIMAL(10, 2) NOT NULL,
    descontos DECIMAL(10, 2) NOT NULL,
    valor_liquido DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(motorista_id, mes, ano) -- Garante que não haja duplicação de rendimentos para o mesmo motorista no mesmo mês/ano
);

-- Inserir um usuário administrador padrão (senha: admin123)
INSERT INTO motoristas (nome, documento, senha, is_admin) 
VALUES ('Administrador', 'admin', '$2b$10$X/QQvA2ARdFrYGGNpuFvVeEPmLXBAvAUPYAA.Lz9G7cgFUJHBx3Oe', TRUE);

-- Comentários explicativos
COMMENT ON TABLE motoristas IS 'Tabela para armazenar informações dos motoristas e administradores';
COMMENT ON TABLE rendimentos IS 'Tabela para armazenar os dados de rendimento mensal dos motoristas';
