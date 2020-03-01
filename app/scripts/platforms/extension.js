import extension from 'extensionizer'
import { createExplorerLink as explorerLink } from '@metamask/etherscan-link'
import { getEnvironmentType, checkForError } from '../lib/util'
import { ENVIRONMENT_TYPE_BACKGROUND } from '../lib/enums'
import pify from 'pify'

const PIFY_OPTS = {
  errorFirst: false,
}

class ExtensionPlatform {

  //
  // Public
  //
  reload () {
    extension.runtime.reload()
  }

  /**
   * Open new tab in browser with the given URL.
   * @returns {tabs.Tab} Object with information about the opened tab.
   */
  async openWindow ({ url }) {
    return await pify(extension.tabs.create({ url }), PIFY_OPTS)
  }

  closeCurrentWindow () {
    return extension.windows.getCurrent((windowDetails) => {
      return extension.windows.remove(windowDetails.id)
    })
  }

  getVersion () {
    return extension.runtime.getManifest().version
  }

  /**
   * Opens the extension in a new browser tab.
   *
   * @param {string} [route] - The route to add to the extension URL.
   * @param {string} [queryString] - The query string to add to the extension URL.
   * @returns {tabs.Tab} Object with information about the opened tab.
   */
  async openExtensionInBrowser (route = null, queryString = null) {
    let extensionURL = extension.runtime.getURL('home.html')

    if (queryString) {
      extensionURL += `?${queryString}`
    }

    if (route) {
      extensionURL += `#${route}`
    }

    if (getEnvironmentType() !== ENVIRONMENT_TYPE_BACKGROUND) {
      window.close()
    }

    return await this.openWindow({ url: extensionURL })
  }

  getPlatformInfo (cb) {
    try {
      extension.runtime.getPlatformInfo((platform) => {
        cb(null, platform)
      })
    } catch (e) {
      cb(e)
    }
  }

  showTransactionNotification (txMeta) {
    const { status, txReceipt: { status: receiptStatus } = {} } = txMeta

    if (status === 'confirmed') {
      // There was an on-chain failure
      receiptStatus === '0x0'
        ? this._showFailedTransaction(txMeta, 'Transaction encountered an error.')
        : this._showConfirmedTransaction(txMeta)
    } else if (status === 'failed') {
      this._showFailedTransaction(txMeta)
    }
  }

  currentTab () {
    return new Promise((resolve, reject) => {
      extension.tabs.getCurrent((tab) => {
        const err = checkForError()
        if (err) {
          reject(err)
        } else {
          resolve(tab)
        }
      })
    })
  }

  switchToTab (tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.update(tabId, { highlighted: true }, (tab) => {
        const err = checkForError()
        if (err) {
          reject(err)
        } else {
          resolve(tab)
        }
      })
    })
  }

  closeTab (tabId) {
    return new Promise((resolve, reject) => {
      extension.tabs.remove(tabId, () => {
        const err = checkForError()
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  _showConfirmedTransaction (txMeta) {

    this._subscribeToNotificationClicked()

    const url = explorerLink(txMeta.hash, parseInt(txMeta.metamaskNetworkId))
    const nonce = parseInt(txMeta.txParams.nonce, 16)

    const title = 'Confirmed transaction'
    const message = `Transaction ${nonce} confirmed! View on Etherscan`
    this._showNotification(title, message, url)
  }

  _showFailedTransaction (txMeta, errorMessage) {

    const nonce = parseInt(txMeta.txParams.nonce, 16)
    const title = 'Failed transaction'
    const message = `Transaction ${nonce} failed! ${errorMessage || txMeta.err.message}`
    this._showNotification(title, message)
  }

  _showNotification (title, message, url) {
    extension.notifications.create(
      url,
      {
        'type': 'basic',
        'title': title,
        'iconUrl': extension.extension.getURL('../../images/icon-64.png'),
        'message': message,
      })
  }

  _subscribeToNotificationClicked () {
    if (!extension.notifications.onClicked.hasListener(this._viewOnEtherscan)) {
      extension.notifications.onClicked.addListener(this._viewOnEtherscan)
    }
  }

  _viewOnEtherscan (txId) {
    if (txId.startsWith('http://')) {
      this.openWindow({ url: txId })
    }
  }
}

export default ExtensionPlatform
