import React, { PureComponent, useContext } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { I18nContext } from '../../../contexts/i18n'

const Popover = ({
  title,
  subtitle = '',
  footer,
  footerClassName,
  onBack,
  onClose,
  className,
  showArrow,
  PopoverContent,
  focusedElStyleProps,
}) => {
  const t = useContext(I18nContext)
  const { width, height, top, left } = focusedElStyleProps

  return (
    <div className="experimental-popover-container">
      <div
        className="experimental-popover-bg"
        onClick={onClose}
        style={{
          width: width + 10,
          height: height + 6,
          left: left - 5,
          top: top - 3,
        }}
      />
      <section
        className={classnames('experimental-popover-wrap', className)}
        style={{ top: top + height + 20 }}
      >
        { showArrow
          ? (
            <div
              className="experimental-popover-arrow"
              style={{
                left: left - 11 + (width / 2),
                top: top + height + 14,
              }}
            />
          )
          : null
        }
        <header className="experimental-popover-header">
          <div className="experimental-popover-header__title">
            <h2 title={title}>
              {
                onBack
                  ? (
                    <button
                      className="fas fa-chevron-left experimental-popover-header__button"
                      title={t('back')}
                      onClick={onBack}
                    />
                  )
                  : null
              }
              {title}
            </h2>
            <button
              className="fas fa-times experimental-popover-header__button"
              title={t('close')}
              onClick={onClose}
            />
          </div>
          { subtitle ? <p className="experimental-popover-header__subtitle">{subtitle}</p> : null }
        </header>
        {
          PopoverContent
            ? (
              <div className="experimental-popover-content">
                {PopoverContent}
              </div>
            )
            : null
        }
        {
          footer
            ? (
              <footer className={classnames('experimental-popover-footer', footerClassName)}>
                {footer}
              </footer>
            )
            : null
        }
      </section>
    </div>
  )
}

Popover.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
}

export default class PopoverPortal extends PureComponent {
  static propTypes = Popover.propTypes

  rootNode = document.getElementById('experimental-popover-content')

  instanceNode = document.createElement('div')

  state = {
    focusedElStyleProps: {},
  }

  getFocusedElStyleProps (el) {
    const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = el

    return {
      width: offsetWidth,
      height: offsetHeight,
      top: offsetTop,
      left: offsetLeft,
    }
  }

  componentDidMount () {
    if (this.focusedElementRef) {
      setTimeout(() => {
        const focusedElStyleProps = this.getFocusedElStyleProps(this.focusedElementRef.children[0])
        this.setState({ focusedElStyleProps })
      }, 0)
    }

    if (!this.rootNode) {
      return
    }

    this.rootNode.appendChild(this.instanceNode)

  }

  componentWillUnmount () {
    if (!this.rootNode) {
      return
    }

    this.rootNode.removeChild(this.instanceNode)
  }

  render () {
    const focusedElement = this.props.children
    const children = (
<>
      <div
        ref={(node) => {
          this.focusedElementRef = node
        }}
        className="experimental-popover-focused-element-wrapper"
      >
        { focusedElement }
      </div>
      <Popover {...this.props} focusedElStyleProps={this.state.focusedElStyleProps} />
</>
    )

    return this.rootNode
      ? ReactDOM.createPortal(children, this.instanceNode)
      : children
  }
}
