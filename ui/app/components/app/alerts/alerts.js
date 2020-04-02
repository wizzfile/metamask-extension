import React from 'react'
import { useSelector } from 'react-redux'

import UnconnectedAccountAlert from './unconnected-account-alert'
import { alertIsOpen as unconnectedAccountAlertIsOpen } from '../../../ducks/alerts/unconnected-account'

const Alerts = () => {
  const isOpen = useSelector(unconnectedAccountAlertIsOpen)

  if (isOpen) {
    return (
      <UnconnectedAccountAlert />
    )
  }

  return null
}

export default Alerts
