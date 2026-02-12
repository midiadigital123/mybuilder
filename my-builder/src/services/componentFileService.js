import CONSTANTS from "../renderer/constants/CONSTANTS.js";

/**
 * Serviço para gerenciar arquivos temporários de componentes.
 * Abstrai as chamadas IPC para o main process.
 */
const componentFileService = {
  /**
   * Cria os arquivos temporários de um componente após fetch do servidor
   * @param {string} alias - Alias do componente (ex: "destaque")
   * @param {object} files - { html: string, css: string, js: string }
   * @returns {Promise<{success: boolean, alias?: string, error?: string}>}
   */
  async create(alias, files) {
    return await window.api.createComponentFiles(alias, files, CONSTANTS.YEAR);
  },

  /**
   * Lê os arquivos temporários de um componente
   * @param {string} alias - Alias do componente
   * @returns {Promise<{success: boolean, files?: object, error?: string}>}
   */
  async read(alias) {
    return await window.api.readComponentFiles(alias, CONSTANTS.YEAR);
  },

  /**
   * Atualiza um arquivo específico (usado ao salvar edições do usuário)
   * @param {string} alias - Alias do componente
   * @param {string} fileType - "html", "css" ou "js"
   * @param {string} content - Novo conteúdo
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async update(alias, fileType, content) {
    return await window.api.updateComponentFile(
      alias,
      fileType,
      content,
      CONSTANTS.YEAR,
    );
  },

  /**
   * Deleta os arquivos temporários (quando componente é desativado)
   * @param {string} alias - Alias do componente
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async delete(alias) {
    return await window.api.deleteComponentFiles(alias, CONSTANTS.YEAR);
  },

  /**
   * Lista todos os componentes com arquivos temporários ativos
   * @returns {Promise<{success: boolean, aliases?: string[], error?: string}>}
   */
  async listActive() {
    return await window.api.listComponentFiles(CONSTANTS.YEAR);
  },
};

export default componentFileService;
