import CONSTANTS from "../../constants/CONSTANTS";

const createFolders = async (year) => await window.api.createFolder(year);

const init = async () => {
    await createFolders(CONSTANTS.YEAR);
};

const createStandartFolderController = {
  init
};
export default createStandartFolderController;