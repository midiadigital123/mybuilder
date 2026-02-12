import CONSTANTS from "../renderer/constants/CONSTANTS.js";

const fetchData = async (data) => {
  const { alias, selectedModel, selectedVersion } = data;
  const result = { ...data }; // Inicia com os dados existentes

  const [htmlFileUrl, cssFileUrl, jsFileUrl] = [
    `https://recursos-moodle.caeddigital.net/projetos/componentes/${CONSTANTS.YEAR}/${alias}/${selectedModel}${selectedVersion}/index.html`,
    `https://recursos-moodle.caeddigital.net/projetos/componentes/${CONSTANTS.YEAR}/${alias}/${selectedModel}${selectedVersion}/style.css`,
    `https://recursos-moodle.caeddigital.net/projetos/componentes/${CONSTANTS.YEAR}/${alias}/${selectedModel}${selectedVersion}/script.js`,
  ];

  // Função para buscar um arquivo via API
  const fetchFile = async (url) => {
    try {
      const response = await window.api.getFileAtServer(url);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar o arquivo em ${url}:`, error);
      return "";
    }
  };

  try {
    const [htmlContent, cssContent, jsContent] = await Promise.all([
      fetchFile(htmlFileUrl),
      fetchFile(cssFileUrl),
      fetchFile(jsFileUrl),
    ]);
    // Retorna os conteúdos obtidos
    result.html = htmlContent;
    result.css = cssContent;
    result.js = jsContent;
    // console.log("Conteúdos obtidos:", { htmlContent, cssContent, jsContent });
    return result;
  } catch (error) {
    console.error("Erro ao buscar os arquivos do componente:", error);
    return data;
  }
};

export default fetchData;
