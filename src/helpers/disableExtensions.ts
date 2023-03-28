// These are extensions that are known to interfere with the operation of Taxy.
// We'll turn them off temporarily while Taxy is performing actions.
const incompatibleExtensions = [
  // Dashlane
  'fdjamakpfbbddfjaooikfcpapjohcfmg',
  // LastPass
  'hdokiejnpimakedhajhdlcegeplioahd',
];

const disableCounts: Record<string, number> = {};

export const disableIncompatibleExtensions = async () => {
  const enabledBlacklistedExtensions = await new Promise<
    chrome.management.ExtensionInfo[]
  >((resolve, reject) => {
    chrome.management.getAll((extensions) => {
      if (chrome.runtime.lastError) {
        console.error(
          'Failed to get extensions:',
          chrome.runtime.lastError.message
        );
        reject(chrome.runtime.lastError);
      } else {
        resolve(
          extensions.filter(
            (extension) =>
              extension.type === 'extension' &&
              extension.enabled &&
              incompatibleExtensions.includes(extension.id)
          )
        );
      }
    });
  });

  for (const extension of enabledBlacklistedExtensions) {
    chrome.management.setEnabled(extension.id, false, () => {
      if (chrome.runtime.lastError) {
        console.error(
          `Failed to disable extension ${extension.id}:`,
          chrome.runtime.lastError.message
        );
      }
      disableCounts[extension.id] = (disableCounts[extension.id] || 0) + 1;
    });
  }
};

export const reenableExtensions = async () => {
  const disabledBlacklistedExtensions = await new Promise<
    chrome.management.ExtensionInfo[]
  >((resolve, reject) => {
    chrome.management.getAll((extensions) => {
      if (chrome.runtime.lastError) {
        console.error(
          'Failed to get extensions:',
          chrome.runtime.lastError.message
        );
        reject(chrome.runtime.lastError);
      } else {
        resolve(
          extensions.filter(
            (extension) =>
              extension.type === 'extension' &&
              !extension.enabled &&
              incompatibleExtensions.includes(extension.id)
          )
        );
      }
    });
  });

  for (const extension of disabledBlacklistedExtensions) {
    if (disableCounts[extension.id] > 1) {
      // If we have multiple sessions running and have disabled the extension
      // multiple times, we only want to re-enable it once all sessions have
      // finished.
      disableCounts[extension.id] = disableCounts[extension.id] - 1;
    } else if (disableCounts[extension.id] === 1) {
      await new Promise((resolve, reject) => {
        chrome.management.setEnabled(extension.id, true, () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Failed to enable extension ${extension.id}:`,
              chrome.runtime.lastError.message
            );
            reject(chrome.runtime.lastError);
          }
          delete disableCounts[extension.id];
          resolve(0);
        });
      });
    }
  }
};
