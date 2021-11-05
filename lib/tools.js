const path = require('path');
const fs = require('fs');
const downloadMgr = require('./downloadManager');

const moduleName = '[@tizentv/tools]';
const tizenDownloadUrl = 'http://download.tizen.org/sdk/tizenstudio/official';

const toolsPathMapWin = [
  { name: 'sdb', exec: 'sdb.exe', filter: 'data/tools' },
  {
    name: 'certificate-encryptor',
    exec: 'wincrypt.exe',
    filter: 'data/tools/certificate-encryptor'
  },
  {
    name: 'certificate-generator',
    exec: 'KeyCertGeneratorApi.jar',
    filter: 'data/tools/certificate-generator'
  }
];
const toolsPathMapLinux = [
  { name: 'sdb', exec: 'sdb', filter: 'data/tools' },
  {
    name: 'certificate-encryptor',
    exec: 'secret-tool',
    filter: 'data/tools/certificate-encryptor'
  },
  {
    name: 'certificate-generator',
    exec: 'KeyCertGeneratorApi.jar',
    filter: 'data/tools/certificate-generator'
  },
  {
    name: 'cross-arm-gdb-8.3.1',
    exec: 'arm-linux-gnueabi-gdb',
    filter: 'data/tools/arm-linux-gnueabi-gdb-8.3.1/bin'
  }
];
const toolsPathMapMac = [
  { name: 'sdb', exec: 'sdb', filter: 'data/tools' },
  {
    name: 'certificate-encryptor',
    exec: 'secret-tool',
    filter: 'data/tools/certificate-encryptor'
  },
  {
    name: 'certificate-generator',
    exec: 'KeyCertGeneratorApi.jar',
    filter: 'data/tools/certificate-generator'
  }
];

async function getToolPath(toolName, options) {
  console.info(moduleName + 'tools.getToolPath: toolName = ' + toolName);
  let toolDir = getPlatformToolDir();
  let toolExec = getToolSubPath(toolName);

  if (toolExec == undefined) {
    console.info(moduleName + 'tools.getToolPath: not support ' + toolName);
    return '';
  }

  if (!fs.existsSync(path.resolve(toolDir, toolName, toolExec))) {
    console.info(
      moduleName +
        'tools.getToolPath:The tool is not existed, download ' +
        toolName
    );
    try {
      var pkgInfo = await downloadMgr.getPackageInfo(
        tizenDownloadUrl,
        toolName,
        options
      );
    } catch (ex) {
      throw 'Get package info exception!';
    }
    await downloadMgr.downloadPkg(pkgInfo, options);
    await downloadMgr.unzipPkgDir(
      path.resolve(getPlatformToolDir(), 'tmp'),
      path.resolve(toolDir, toolName),
      getUnzipFilter(toolName)
    );
    checkExecPermission(path.resolve(toolDir, toolName, toolExec));
    fs.rmdirSync(path.resolve(getPlatformToolDir(), 'tmp'));
  }
  return path.resolve(toolDir, toolName, toolExec);
}

function getPlatformToolDir() {
  if (process.platform == 'win32') {
    return 'C:\\tizentv-tools';
  } else {
    return path.resolve(process.env.HOME, 'tizentv-tools');
  }
}

function getToolSubPath(toolName) {
  let toolObj;
  if (process.platform == 'win32') {
    toolObj = toolsPathMapWin.find(element => {
      return element.name == toolName;
    });
  } else if (process.platform == 'linux') {
    toolObj = toolsPathMapLinux.find(element => {
      return element.name == toolName;
    });
  } else {
    toolObj = toolsPathMapMac.find(element => {
      return element.name == toolName;
    });
  }
  return toolObj == undefined ? undefined : toolObj.exec;
}

function getUnzipFilter(toolName) {
  console.info(moduleName + 'tools.getUnzipFilter: start...');
  let toolObj;
  if (process.platform == 'win32') {
    toolObj = toolsPathMapWin.find(element => {
      return element.name == toolName;
    });
  } else if (process.platform == 'linux') {
    toolObj = toolsPathMapLinux.find(element => {
      return element.name == toolName;
    });
  } else {
    toolObj = toolsPathMapMac.find(element => {
      return element.name == toolName;
    });
  }
  return toolObj == undefined ? '' : toolObj.filter;
}

function checkExecPermission(execPath) {
  console.info(
    moduleName + 'tools.checkExecPermission: execPath = ' + execPath
  );
  try {
    fs.accessSync(execPath, fs.constants.S_IXUSR);
  } catch (err) {
    fs.chmodSync(
      execPath,
      fs.constants.S_IRWXU |
        fs.constants.S_IRWXG |
        fs.constants.S_IROTH |
        fs.constants.S_IXOTH
    );
  }
}

async function getSdbPath(options) {
  let sdbPath = await getToolPath('sdb', options);
  return sdbPath;
}

async function getEncryptorPath(options) {
  let encryptorPath = await getToolPath('certificate-encryptor', options);
  return encryptorPath;
}

async function getTizenCertPath(options) {
  let certGeneratorPath = await getToolPath('certificate-generator', options);
  return path.dirname(certGeneratorPath);
}

async function getSamsungCertPath(options) {
  console.info(moduleName + 'tools.getSamsungCertPath: start...');
  let samsungCertPath = path.resolve(
    getPlatformToolDir(),
    'samsung-certificate'
  );
  if (!fs.existsSync(samsungCertPath)) {
    await downloadMgr.downloadSamsungCertfile(
      tizenDownloadUrl,
      samsungCertPath,
      options
    );
  }
  return samsungCertPath;
}

module.exports = {
  getToolPath,
  getSdbPath,
  getEncryptorPath,
  getTizenCertPath,
  getSamsungCertPath
};
