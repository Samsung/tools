const path = require('path');
const fs = require('fs');
const downloadMgr = require('./downloadManager');

const moduleName = '[@tizentv/tools]';
const tizenDownloadUrl = 'http://download.tizen.org/sdk/tizenstudio/official';
//const platform = process.platform == 'win32' ? `windows` : process.platform == 'linux' ? `ubuntu` : 'macos';
const extensionRoot = path.resolve(__dirname, '..');
const tmpDir = path.resolve(extensionRoot, 'tmp');

/*
    let certPath = await tools.getToolPath('certificate-generator');
    let sdbPath = await tools.getToolPath('sdb');
    let sdbPath = await tools.getToolPath('certificate-encryptor');
*/


async function getToolPath(toolName) {
    console.info(moduleName + 'tools.getToolPath: toolName = ' + toolName);
    if (!fs.existsSync(caPriKeyPath)) {
        
	}
	
    let pkgInfo = await downloadMgr.getPackageInfo(tizenDownloadUrl, toolName);
    await downloadMgr.downloadPkg(pkgInfo);
    //await downloadMgr.unzipPkgDir(tmpDir, extensionRoot, 'data');
    //await downloadMgr.unzipPkgDir(tmpDir, extensionRoot, '');
    //await downloadMgr.unzipPkgDir(tmpDir, extensionRoot);
    //fs.rmdirSync(tmpDir);
}

function download(toolName) {
    console.info(moduleName + 'tools.download: toolName = ' + toolName);
}

function getPlatformToolRoot() {
    console.info(moduleName + 'tools.getPlatformToolRootPath: start...');
    if (process.platform == 'win32') {
        return 'C:\tizentv-tools';
    } else {
        return '~/tizentv-tools';
    }
}

module.exports = {
    getToolPath
};