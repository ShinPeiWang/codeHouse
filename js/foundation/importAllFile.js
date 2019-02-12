/**
 *一次載入所有資料夾底下的元件
**/

const files = require.context('projectFile/components/gameTpl', false, /\.vue$/);
const modules = {};

files.keys().forEach((key) => {
    modules[key.replace(/(\.\/|\.vue)/g, '')] = files(key).default;
});

export default modules;
