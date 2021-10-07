type Options = {
  /**
   * Proxy address
   */
  proxy: string;
};
/**
 * Download the tizen tool and return the tool's path.
 *
 * Check whole package with your OS version :
 * - [windows-32](http://download.tizen.org/sdk/tizenstudio/official/pkg_list_windows-32)
 * - [windows-64](http://download.tizen.org/sdk/tizenstudio/official/pkg_list_windows-64)
 * - [ubuntu-32](http://download.tizen.org/sdk/tizenstudio/official/pkg_list_ubuntu-32)
 * - [ubuntu-64](http://download.tizen.org/sdk/tizenstudio/official/pkg_list_ubuntu-64)
 * - [macos-64](http://download.tizen.org/sdk/tizenstudio/official/pkg_list_macos-64)
 *
 * In *Linux* or *OSX*, the download root is `~/tizen-tools`.
 *
 * In *Window*, the download root is `C:\\tizen-tools`.
 * @param toolName Tool name.
 * @param options `Optional`. Set a proxy address manually. Or work with npm's proxy.
 */
export function getToolPath(
  toolName: string,
  option?: Options
): Promise<string>;

/**
 * Download the `sdb` and get the path.
 * @param option `Optional`. Set a proxy address manually. Or work with npm's proxy.
 */
export function getSdbPath(option?: Options): Promise<string>;

/**
 * Download the `certificate-encryptor` and get the path.
 * @param option `Optional`. Set a proxy address manually. Or work with npm's proxy.
 */
export function getEncryptorPath(option?: Options): Promise<string>;

/**
 * Download the `certificate-generator` and get the path.
 * @param option `Optional`. Set a proxy address manually. Or work with npm's proxy.
 */
export function getTizenCertPath(option?: Options): Promise<string>;

/**
 * Download the `samsung-certificate` and get the path.
 * @param option `Optional`. Set a proxy address manually. Or work with the npm's proxy.
 */
export function getSamsungCertPat(option?: Options): Promise<string>;
