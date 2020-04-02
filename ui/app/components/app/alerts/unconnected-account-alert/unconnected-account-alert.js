import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  ALERT_STATE,
  connectAccount,
  dismissAlert,
  getAlertState,
} from '../../../../ducks/alerts/unconnected-account'
import { I18nContext } from '../../../../contexts/i18n'
import Popover from '../../../ui/popover'
import Button from '../../../ui/button'
import { getEnvironmentType } from '../../../../../../app/scripts/lib/util'
import { ENVIRONMENT_TYPE_POPUP } from '../../../../../../app/scripts/lib/enums'

const {
  ERROR,
  LOADING,
  OPEN,
} = ALERT_STATE

const SwitchToUnconnectedAccountAlert = () => {
  const t = useContext(I18nContext)
  const dispatch = useDispatch()
  const alertState = useSelector(getAlertState)

  switch (alertState) {
    case OPEN:
    case LOADING: {
      return (
        <Popover
          title={t('unconnectedAccountAlertTitle')}
          subtitle={t('unconnectedAccountAlertDescription')}
          onClose={() => dispatch(dismissAlert())}
          footer={(
            <>
              <Button
                disabled={alertState === LOADING}
                onClick={() => dispatch(dismissAlert())}
                type="secondary"
              >
                { t('dismiss') }
              </Button>
              <Button
                disabled={alertState === LOADING}
                onClick={() => dispatch(connectAccount())}
                type="primary"
              >
                { t('connect') }
              </Button>
            </>
          )}
          footerClassName="unconnected-account-alert__footer"
        >
        </Popover>
      )
    }
    case ERROR: {
      return (
        <Popover
          title={t('errorPageTitle')}
          subtitle={
            getEnvironmentType() === ENVIRONMENT_TYPE_POPUP
              ? t('errorPagePopupMessage')
              : t('errorPageMessage')
          }
          onClose={() => dispatch(dismissAlert())}
          footer={(
            <Button type="secondary" onClick={() => dispatch(dismissAlert())}>
              { t('dismiss') }
            </Button>
          )}
        >
        </Popover>
      )
    }
    default: {
      throw new Error(`Invalid alert state '${alertState}'`)
    }
  }
}

export default SwitchToUnconnectedAccountAlert
