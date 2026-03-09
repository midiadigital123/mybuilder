/**
 * componentDiscovery.js
 *
 * Serviço para descoberta automática de componentes disponíveis no servidor FTP.
 *
 * Substitui os dados mockados, buscando diretamente do servidor:
 * - Lista de componentes (aliases)
 * - Modelos disponíveis por componente (m1, m2, m3...)
 * - Versões disponíveis por componente (v1, v2, v3...)
 *
 * Estrutura esperada no FTP:
 * /projetos/componentes/2026/
 * ├── destaque/
 * │   ├── m1v1/
 * │   ├── m1v2/
 * │   ├── m2v1/
 * │   └── m2v2/
 * ├── citacao/
 * │   └── m1v1/
 * └── layout/
 *     └── m1v1/
 */

import ftp from "basic-ftp";
import dotenv from "dotenv";

// Carrega variáveis de ambiente do .env
dotenv.config();

// Configuração do FTP
const FTP_CONFIG = {
  host: process.env.FTP_HOST || "10.10.9.27",
  port: parseInt(process.env.FTP_PORT) || 6798,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  secure: process.env.FTP_SECURE === "true",
};

// Caminho base dos componentes no servidor
const COMPONENTS_BASE_PATH =
  process.env.FTP_COMPONENTS_PATH || "/projetos/componentes/2026";

// Componentes que são estruturais (sempre ativos)
const STRUCTURAL_COMPONENTS = ["layout", "tipografia"];

/**
 * Lista todos os componentes disponíveis no servidor FTP
 *
 * @returns {Promise<Array>} Array de objetos de componentes
 * @throws {Error} Se falhar conexão ou leitura do FTP
 */
export async function listarComponentesDisponiveis() {
  const client = new ftp.Client();
  client.ftp.verbose = false; // Desliga logs verbosos

  try {
    console.log("[FTP] Conectando ao servidor...");
    await client.access(FTP_CONFIG);

    console.log("[FTP] Navegando para:", COMPONENTS_BASE_PATH);
    await client.cd(COMPONENTS_BASE_PATH);

    // Lista todas as pastas (aliases dos componentes)
    const componentFolders = await client.list();
    console.log(`[FTP] Encontradas ${componentFolders.length} pastas`);

    const components = [];
    let componentId = 1;

    // Itera sobre cada pasta de componente
    for (const folder of componentFolders) {
      // Ignora arquivos, processa apenas diretórios
      if (!folder.isDirectory) continue;

      const alias = folder.name; // ex: "destaque", "citacao"
      console.log(`[FTP] Processando componente: ${alias}`);

      try {
        // Entra na pasta do componente
        await client.cd(alias);

        // Lista modelos+versões (ex: m1v1, m1v2, m2v1)
        const variants = await client.list();

        // Extrai modelos e versões únicos
        const models = new Set();
        const versions = new Set();

        // Regex para extrair modelo e versão (formato: m1v1, m2v3, etc)
        const variantPattern = /^m(\d+)v(\d+)$/;

        variants.forEach((variant) => {
          if (variant.isDirectory) {
            const match = variant.name.match(variantPattern);
            if (match) {
              const modelNum = match[1];
              const versionNum = match[2];

              models.add(`m${modelNum}`);
              versions.add(`v${versionNum}`);
            }
          }
        });

        // Só adiciona se encontrou pelo menos uma variante válida
        if (models.size > 0 && versions.size > 0) {
          const sortedModels = Array.from(models).sort();
          const sortedVersions = Array.from(versions).sort();

          components.push({
            id: `comp-${componentId}`,
            name: capitalize(alias),
            alias: alias,
            models: sortedModels,
            versions: sortedVersions,
            focused: false,
            isActive: STRUCTURAL_COMPONENTS.includes(alias), // Estruturais já vêm ativos
            isStructural: STRUCTURAL_COMPONENTS.includes(alias),
            selectedModel: sortedModels[0], // Seleciona primeiro modelo por padrão
            selectedVersion: sortedVersions[0], // Seleciona primeira versão por padrão
          });

          componentId++;

          console.log(
            `[FTP]   ✓ ${alias}: ${sortedModels.length} modelos, ${sortedVersions.length} versões`,
          );
        } else {
          console.log(`[FTP]   ⚠ ${alias}: nenhuma variante válida encontrada`);
        }

        // Volta pra pasta raiz de componentes
        await client.cdup();
      } catch (err) {
        console.error(`[FTP]   ✗ Erro ao processar ${alias}:`, err.message);
        // Continua processando outros componentes mesmo se um falhar
        await client.cd(COMPONENTS_BASE_PATH); // Garante que voltou pra raiz
      }
    }

    console.log(
      `[FTP] ✓ Discovery concluído: ${components.length} componentes encontrados`,
    );
    return components;
  } catch (err) {
    console.error("[FTP] ✗ Erro na conexão ou listagem:", err);
    throw new Error(`Falha ao buscar componentes do FTP: ${err.message}`);
  } finally {
    client.close();
    console.log("[FTP] Conexão fechada");
  }
}

/**
 * Verifica se as credenciais FTP estão configuradas
 *
 * @returns {boolean} True se credenciais estão OK
 */
export function verificarCredenciais() {
  const credenciaisOK = !!(
    process.env.FTP_HOST &&
    process.env.FTP_PORT &&
    process.env.FTP_USER &&
    process.env.FTP_PASS
  );

  if (!credenciaisOK) {
    console.warn("[FTP] ⚠ Credenciais não configuradas no arquivo .env");
    console.warn("[FTP] Necessário: FTP_HOST, FTP_PORT, FTP_USER, FTP_PASS");
  }

  return credenciaisOK;
}

/**
 * Testa conexão com o servidor FTP
 *
 * @returns {Promise<boolean>} True se conectou com sucesso
 */
export async function testarConexao() {
  const client = new ftp.Client();

  try {
    console.log("[FTP] Testando conexão...");
    await client.access(FTP_CONFIG);
    console.log("[FTP] ✓ Conexão bem-sucedida");
    return true;
  } catch (err) {
    console.error("[FTP] ✗ Falha na conexão:", err.message);
    return false;
  } finally {
    client.close();
  }
}

/**
 * Capitaliza primeira letra de uma string
 *
 * @param {string} str - String para capitalizar
 * @returns {string} String capitalizada
 *
 * @example
 * capitalize('destaque') → 'Destaque'
 * capitalize('citacao')  → 'Citacao'
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
