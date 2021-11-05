const fs = require('fs');
const path = require('path');
const readline = require('readline');
const got = require('got');
const hpagent = require('hpagent');
const stream = require('stream');
const { promisify } = require('util');
const decompress = require('decompress');
const npmConf = require('npm-conf')();
const xml2js = require('xml2js');

const platform =
  process.platform == 'win32'
    ? `windows`
    : process.platform == 'linux'
    ? `ubuntu`
    : 'macos';
const pipeline = promisify(stream.pipeline);
const extensionRoot = path.resolve(__dirname, '..');
const toolsDir = path.resolve(extensionRoot, 'tools');
const platformToolDir =
  process.platform == 'win32'
    ? 'C:\\tizentv-tools'
    : path.resolve(process.env.HOME, 'tizentv-tools');
const tmpDir = path.resolve(platformToolDir, 'tmp');
const moduleName = '[@tizentv/tools]';

class PackageInfo {
  constructor(url) {
    this._archived = undefined;
    this.rootURL = url;
    this.details = {
      version: '',
      path: '',
      sha256: '',
      size: ''
    };
    this.unknownItems = Object.keys(this.details).length;
    console.log(this.details);
  }

  get archived() {
    return this._archived;
  }
  set archived(isArchived) {
    this._archived = isArchived;
  }
  get path() {
    return this.details.path;
  }
  get version() {
    return this.details.version;
  }
  get sha256() {
    return this.details.sha256;
  }
  get size() {
    return this.details.size;
  }

  collectPkgInfo(info) {
    let entry = info.split(':');
    let prop = entry[0].toLocaleLowerCase().trim();
    let propValue = entry[1].trim();
    if (this.details.hasOwnProperty(prop)) {
      if (this.details[prop] == '' && propValue != '') {
        this.details[prop] = propValue;
        this.unknownItems--;
      }
    }

    if (this.unknownItems == 0) {
      this._archived = true;
    }
  }
}

function getPackageInfo(rootURL, packageName, options) {
  console.info(moduleName + 'downloadManager.getPackageInfo(): start...');
  const bit = process.arch == 'x64' ? '64' : '32';
  const platform =
    process.platform == 'win32'
      ? `windows-${bit}`
      : process.platform == 'linux'
      ? `ubuntu-${bit}`
      : 'macos-64';
  let pkgList = rootURL + `/pkg_list_${platform}`;

  return new Promise(async (resolve, reject) => {
    console.info(
      moduleName + 'downloadManager.getPackageInfo(): request to: ' + pkgList
    );
    let userAgent = getUserAgent(pkgList, options);
    try {
      var pkglistStream = await got.stream(pkgList, userAgent);
    } catch (error) {
      console.error(
        moduleName + 'downloadManager.getPackageInfo: got.stream(): ' + error
      );
      reject('got.stream failed!');
    }
    let pkgInfo = new PackageInfo(rootURL);
    let rl = readline.createInterface({ input: pkglistStream });
    rl.on('line', line => {
      if (pkgInfo.archived) {
        rl.close();
      }

      const searchPackage = `Package : ${packageName}`;
      if (line === searchPackage) {
        console.info(
          moduleName +
            'downloadManager.getPackageInfo(): got package info: ' +
            line
        );
        pkgInfo.archived = false;
      }

      if (pkgInfo.archived === false) {
        pkgInfo.collectPkgInfo(line);
      }
    });

    rl.on('close', () => {
      resolve(pkgInfo);
    });
  });
}

function getExtensionPkgInfo(extensionInfoUrl, packageName, options) {
  console.info(
    moduleName +
      'downloadManager.getExtensionPkgInfo(): extensionInfoUrl = ' +
      extensionInfoUrl +
      ', packageName = ' +
      packageName
  );
  return new Promise(async (resolve, reject) => {
    await downloadPkgFormPath(extensionInfoUrl, options);
    const pathArr = extensionInfoUrl.split('/');
    const xmlFileName = pathArr[pathArr.length - 1];
    const data = fs.readFileSync(path.resolve(tmpDir, xmlFileName));
    let parser = new xml2js.Parser();
    parser.parseString(data, function (err, result) {
      if (err) {
        console.error(
          moduleName + 'downloadManager.getExtensionPkgInfo():' + err
        );
        reject(err);
      } else {
        let samsungCertExtension = result.extensionSDK.extension.find(
          extension => {
            return extension.name == packageName;
          }
        );

        console.info(samsungCertExtension);
        resolve(samsungCertExtension.repository[0].trim());
      }
    });
    fs.unlinkSync(path.resolve(tmpDir, xmlFileName));
  });
}

function getUserAgent(url, options) {
  console.info(moduleName + 'downloadManager.getUserAgent(): url = ' + url);
  const pathArr = url.split('/');
  const httpPrefix = pathArr[0];
  let userAgent;
  let userProxy = getProxy(options);

  if (httpPrefix == 'https:') {
    if (userProxy != undefined && userProxy != '') {
      console.info(
        moduleName +
          'downloadManager.getUserAgent():https userProxy = ' +
          userProxy
      );
      userAgent = {
        agent: {
          https: new hpagent.HttpsProxyAgent({ proxy: userProxy })
        }
      };
    }
  } else {
    if (userProxy != undefined && userProxy != '') {
      console.info(
        moduleName +
          'downloadManager.getUserAgent():http userProxy = ' +
          userProxy
      );
      userAgent = {
        agent: {
          http: new hpagent.HttpProxyAgent({ proxy: userProxy })
        }
      };
    }
  }

  return userAgent;
}

function getProxy(options) {
  if (options != undefined && options.proxy != undefined) {
    return options.proxy;
  }

  let proxy = npmConf.get('http-proxy');
  if (proxy == undefined || proxy == null || proxy == '') {
    proxy = npmConf.get('proxy');
  }
  if (proxy == undefined || proxy == null || proxy == '') {
    proxy = npmConf.get('https-proxy');
  }
  return proxy;
}

async function downloadPkg(packageInfo, options) {
  console.info(moduleName + 'downloadManager.downloadPkg(): start...');
  await downloadPkgFormPath(packageInfo.rootURL + packageInfo.path, options);
}

async function downloadPkgFormPath(packagePath, options) {
  console.info(moduleName + 'downloadManager.downloadPkgFormPath(): start...');
  if (packagePath == undefined || packagePath == '') {
    console.error(
      moduleName +
        'downloadManager.downloadPkgFormPath(): packagePath is invaild!'
    );
    return;
  }
  makeFilePath(tmpDir);

  const pathArr = packagePath.split('/');
  const pkgName = pathArr[pathArr.length - 1];
  let userAgent = getUserAgent(packagePath, options);
  try {
    console.log(
      '[webide-common-tizentv]Downloading from ' +
        packagePath +
        ' to ' +
        tmpDir +
        path.sep +
        pkgName
    );
    await pipeline(
      got.stream(packagePath, userAgent),
      fs.createWriteStream(tmpDir + path.sep + pkgName)
    );
  } catch (error) {
    console.error('[webide-common-tizentv]got.stream(): ' + error);
  }
}

async function unzipPkgDir(zipFileDir, unzipDir, filterStr) {
  console.info(
    moduleName + 'downloadManager.unzipPkgDir(): unzipPkgDir start...'
  );
  if (!fs.existsSync(zipFileDir)) {
    console.warn(
      moduleName + 'downloadManager.unzipPkgDir():No files to unzip.'
    );
    return;
  }
  let dirent = fs.readdirSync(zipFileDir, {
    encoding: 'utf8',
    withFileTypes: false
  });
  if (dirent.length == 0) {
    console.warn(
      moduleName + 'downloadManager.unzipPkgDir():No files to unzip.'
    );
    return;
  }

  for (let zipFile of dirent) {
    await unzipPkg(path.resolve(zipFileDir, zipFile), unzipDir, filterStr);
  }
  //fs.rmdirSync(zipFileDir);
}

async function unzipPkg(zipFile, unzipDir, filterStr) {
  console.info(
    moduleName +
      'downloadManager.unzipPkg(): zipFile = ' +
      zipFile +
      ', unzipDir = ' +
      unzipDir +
      ', filterStr = ' +
      filterStr
  );
  if (!fs.existsSync(zipFile)) {
    console.warn(moduleName + 'downloadManager.unzipPkg():No files to unzip.');
    return;
  }

  if (filterStr == undefined) {
    filterStr = '';
  }

  await decompress(zipFile, unzipDir, {
    filter: file => file.path.startsWith(filterStr),
    map: file => {
      if (filterStr == '') {
        file.path = file.path.substring(0);
      } else {
        file.path = file.path.substring(filterStr.length + 1);
      }
      return file;
    }
  });
  console.info(
    moduleName + `downloadManager.unzipPkg: unzip tool ${zipFile} finish.`
  );
  fs.unlinkSync(zipFile);
}

async function downloadSamsungCertfile(rootURL, destDir, options) {
  console.info(moduleName + 'downloadManager.downloadSamsungCertfile start');
  let samsungCertExtensionUrl = await getExtensionPkgInfo(
    rootURL + '/extension_info.xml',
    'Samsung Certificate Extension',
    options
  );
  await downloadPkgFormPath(samsungCertExtensionUrl, options);
  await unzipPkgDir(tmpDir, tmpDir, 'binary');
  let certAddfileArr = fs.readdirSync(tmpDir);
  let certAddFileName = 'cert-add-on_2.0.42_windows-64.zip';
  for (let fileName of certAddfileArr) {
    if (fileName.indexOf(platform) > 0) {
      certAddFileName = fileName;
    } else {
      fs.unlinkSync(path.resolve(tmpDir, fileName));
    }
  }

  if (platform == 'macos') {
    await unzipPkgDir(
      tmpDir,
      tmpDir,
      'data/tools/certificate-manager/Certificate-manager.app/Contents/Eclipse/plugins'
    );
  } else {
    await unzipPkgDir(tmpDir, tmpDir, 'data/tools/certificate-manager/plugins');
  }
  await unzipPkgDir(tmpDir, destDir, 'res/ca');
  fs.rmdirSync(tmpDir);
}

function makeFilePath(pathName) {
  if (fs.existsSync(pathName)) {
    return true;
  } else {
    if (makeFilePath(path.dirname(pathName))) {
      fs.mkdirSync(pathName);
      return true;
    }
  }
}

module.exports = {
  getPackageInfo,
  getExtensionPkgInfo,
  downloadPkg,
  downloadPkgFormPath,
  unzipPkgDir,
  unzipPkg,
  downloadSamsungCertfile
};
