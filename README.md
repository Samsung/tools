# @tizentv/tools

This is a tools manager project for tizentv development, providing tools download and usage. Developer can get tools path using tools manager interface.

Please note that, In order to use this pacakge, `@tizentv/tools` is required.

## Supported APIs
-   getToolPath(toolName)
-   getSdbPath
-   getEncryptorPath
-   getTizenCertPath
-   getSamsungCertPath

```js
usage:
    /*
     *The tool name can be got from http://download.tizen.org/sdk/tizenstudio/official/pkg_list_*
     * Package : sdb  ===> package name is tool name;
     * Version : 4.2.12
     * OS : windows-64, windows-32
    */
    let sdbPath = await tools.getToolPath('sdb');
    let encryPath = await tools.getEncryptorPath();
    let tizenCertPath = await tools.getTizenCertPath();    //download and return tizen certificate file path.
    let samsungCertPath = await tools.getSamsungCertPath();    //download and return samsung certificate file path.
```
