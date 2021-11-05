# @tizentv/tools

This is a tools manager project for tizentv development, providing tools download and usage. Developer can get tools path using tools manager interface.

Please note that, In order to use this pacakge, `@tizentv/tools` is required.

## Supported APIs

    //options: {proxy: ''}

- getToolPath(toolName, [options])
- getSdbPath([options])
- getEncryptorPath([options])
- getTizenCertPath([options])
- getSamsungCertPath([options])

```js
usage:
    /*
     *The tool name can be got from http://download.tizen.org/sdk/tizenstudio/official/pkg_list_*
     * Package : sdb  ===> package name is tool name;
     * Version : 4.2.12
     * OS : windows-64, windows-32
    */
    let sdbPath_1 = await tools.getToolPath('sdb', {proxy: 'http://192.168.0.1:8080'});
    let sdbPath_2 = await tools.getToolPath('sdb');
    let encryPath = await tools.getEncryptorPath();
    let tizenCertPath = await tools.getTizenCertPath();    //download and return tizen certificate file path.
    let samsungCertPath = await tools.getSamsungCertPath();    //download and return samsung certificate file path.
```
