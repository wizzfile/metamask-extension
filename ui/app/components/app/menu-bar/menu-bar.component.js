import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Tooltip from '../../ui/tooltip'
import Button from '../../ui/button'
import Popover from '../../ui/experimental-popover-with-hole-and-arrow'
import SelectedAccount from '../selected-account'
import ConnectedStatusIndicator from '../connected-status-indicator'
import AccountDetailsDropdown from '../dropdowns/account-details-dropdown'
import { getEnvironmentType } from '../../../../../app/scripts/lib/util'
import { ENVIRONMENT_TYPE_POPUP } from '../../../../../app/scripts/lib/enums'

export default class MenuBar extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  }

  state = { accountDetailsMenuOpen: false }

  renderPopover = () => {
    const { t } = this.context
    return (
      <Popover
        title={ t('whatsthis') }
        onClose={() => {}}
        className="home__connected-status-popover"
        showArrow
        PopoverContent={() => {
          return (
            <>
              <main className="home__connect-status-text">
                <div>{ t('metaMaskConnectStatusParagraphOne') }</div>
                <div>{ t('metaMaskConnectStatusParagraphTwo') }</div>
              </main>
              <div className="home__connect-status-button-container">
                <Button
                  type="primary"
                  className="home__connect-status-button"
                  onClick={() => {}}
                >
                  { t('dismiss') }
                </Button>
              </div>
            </>
          )
        }}
      >
        <ConnectedStatusIndicator />
      </Popover>
    )
  }

  render () {
    const { t } = this.context
    const { accountDetailsMenuOpen } = this.state

    return (
      <div className="menu-bar">
        {
          getEnvironmentType() === ENVIRONMENT_TYPE_POPUP
            ? this.renderPopover()
            : null
        }

        <SelectedAccount />

        <Tooltip title={t('accountOptions')} position="left">
          <button
            className="fas fa-ellipsis-v menu-bar__account-options"
            title={t('accountOptions')}
            onClick={() => {
              this.context.metricsEvent({
                eventOpts: {
                  category: 'Navigation',
                  action: 'Home',
                  name: 'Opened Account Options',
                },
              })
              this.setState((prevState) => ({
                accountDetailsMenuOpen: !prevState.accountDetailsMenuOpen,
              }))
            }}
          >
          </button>
        </Tooltip>

        {
          accountDetailsMenuOpen && (
            <AccountDetailsDropdown
              onClose={() => this.setState({ accountDetailsMenuOpen: false })}
            />
          )
        }
      </div>
    )
  }
}
