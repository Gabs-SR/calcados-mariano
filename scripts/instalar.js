#!/usr/bin/env node

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { gerarHashDeSenha } = require('../src/auth/sessao');

const RAIZ = path.resolve(__dirname, '..');
const NODE_MINIMO = 22;
const SENHA_MINIMA = 10;

const cor = {
    ok: (texto) => `\x1b[32m${texto}\x1b[0m`,
    erro: (texto) => `\x1b[31m${texto}\x1b[0m`,
    fraco: (texto) => `\x1b[2m${texto}\x1b[0m`
};

let passoAtual = 0;
const passo = (texto) => {
    passoAtual += 1;
    console.log(`\n${cor.fraco(`[${passoAtual}/5]`)} ${texto}`);
};

const rodar = (comando, argumentos, pasta = RAIZ) => {
    execFileSync(comando, argumentos, {
        cwd: pasta,
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });
};

const perguntar = (rl, texto, padrao = '') =>
    new Promise((resolve) =>
        rl.question(`${texto}${padrao ? ` [${padrao}]` : ''}: `, (resposta) =>
            resolve(resposta.trim() || padrao)
        )
    );

const perguntarSenha = (texto) =>
    new Promise((resolve) => {
        const entrada = process.stdin;
        const raw = entrada.isTTY;
        process.stdout.write(`${texto}: `);
        if (raw) entrada.setRawMode(true);
        entrada.resume();
        entrada.setEncoding('utf8');

        let senha = '';
        const receber = (tecla) => {
            if (tecla === '\r' || tecla === '\n') {
                if (raw) entrada.setRawMode(false);
                entrada.removeListener('data', receber);
                entrada.pause();
                process.stdout.write('\n');
                resolve(senha);
                return;
            }
            if (tecla === '\u0003') process.exit(1);
            if (tecla === '\u007f' || tecla === '\b') senha = senha.slice(0, -1);
            else senha += tecla;
        };

        entrada.on('data', receber);
    });

function conferirNode() {
    passo('Conferindo o Node.js');
    const versao = Number(process.versions.node.split('.')[0]);
    if (versao < NODE_MINIMO) {
        throw new Error(`Este sistema precisa do Node ${NODE_MINIMO} ou mais novo.`);
    }
    console.log(`${cor.ok('✓')} Node ${process.versions.node}`);
}

function instalarDependencias() {
    passo('Instalando as dependências');
    rodar('npm', ['install']);
    rodar('npm', ['install'], path.join(RAIZ, 'web'));
    console.log(`${cor.ok('✓')} dependências instaladas`);
}

async function prepararConfiguracao() {
    passo('Preparando a configuração');

    const destino = path.join(RAIZ, '.env');
    if (fs.existsSync(destino)) {
        const conteudo = fs.readFileSync(destino, 'utf8');
        if (/^DATABASE_URL=.+$/m.test(conteudo) && /^ADMIN_SENHA_HASH=.+$/m.test(conteudo)) {
            console.log(`${cor.ok('✓')} .env existente mantido`);
            return;
        }
    }

    let databaseUrl = process.env.INSTALAR_DATABASE_URL || '';
    let senha = process.env.INSTALAR_SENHA || '';
    let porta = process.env.INSTALAR_PORTA || '3000';

    if (!databaseUrl || !senha) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        console.log(cor.fraco('\nInforme a conexão PostgreSQL fornecida pelo Supabase.'));
        databaseUrl = databaseUrl || (await perguntar(rl, 'DATABASE_URL'));
        porta = await perguntar(rl, 'Porta', porta);
        rl.close();
    }

    if (!databaseUrl) throw new Error('DATABASE_URL é obrigatória.');

    while (!senha) {
        senha = await perguntarSenha(`Senha do painel (mínimo ${SENHA_MINIMA} caracteres)`);
        if (senha.length < SENHA_MINIMA) {
            console.log(cor.erro(`Use pelo menos ${SENHA_MINIMA} caracteres.`));
            senha = '';
            continue;
        }
        const repetida = await perguntarSenha('Digite a senha novamente');
        if (senha !== repetida) {
            console.log(cor.erro('As senhas não são iguais.'));
            senha = '';
        }
    }

    const linhas = [
        `PORT=${porta}`,
        `DATABASE_URL=${databaseUrl}`,
        '',
        'CORS_ORIGINS=',
        '',
        `ADMIN_SENHA_HASH=${gerarHashDeSenha(senha)}`,
        `SESSAO_SEGREDO=${crypto.randomBytes(32).toString('hex')}`,
        ''
    ].join('\n');

    fs.writeFileSync(destino, linhas, { encoding: 'utf8', mode: 0o600 });
    console.log(`${cor.ok('✓')} .env configurado`);
}

function prepararBanco() {
    passo('Preparando o PostgreSQL/Supabase');
    rodar('npm', ['run', 'db:setup']);
    console.log(`${cor.ok('✓')} banco pronto`);
}

function compilarInterface() {
    passo('Compilando a interface');
    rodar('npm', ['run', 'build'], path.join(RAIZ, 'web'));
    console.log(`${cor.ok('✓')} interface compilada`);
}

function conferirResultado() {
    passo('Conferindo a instalação');
    const env = path.join(RAIZ, '.env');
    const build = path.join(RAIZ, 'web', 'dist', 'index.html');

    if (!fs.existsSync(env) || !fs.existsSync(build)) {
        throw new Error('A instalação terminou sem produzir a configuração ou o build.');
    }

    console.log(`${cor.ok('✓')} tudo no lugar`);
}

async function main() {
    console.log('\nInstalação do sistema da Calçados Mariano\n');
    conferirNode();
    instalarDependencias();
    await prepararConfiguracao();
    prepararBanco();
    compilarInterface();
    conferirResultado();
    console.log(`\n${cor.ok('Pronto.')} Execute:\n\n  npm start\n`);
}

main().catch((erro) => {
    console.error(cor.erro(`\nA instalação parou: ${erro.message}\n`));
    process.exit(1);
});
