import events from './mixins/events'
import draggableMixin from './mixins/draggable'
import React, {
  PropTypes
} from 'react'
import {
  View,
  Image
} from 'react-native'

export default React.createClass({
  mixins: [events(['onLayout']), draggableMixin()],
  subscription: null,

  propTypes: {
    gestures: PropTypes.array.isRequired,
    onError: PropTypes.func.isRequired,
    onGestureComplete: PropTypes.func.isRequired,
    toStyle: PropTypes.func.isRequired,
    style: PropTypes.any,
    children: PropTypes.array,
    type: PropTypes.oneOf([
      'View',
      'Image'
    ]),
    source: PropTypes.any
  },

  componentDidMount () {
    this.subscription = this.layoutStream.subscribe(
      (layout) => {
        // We'll receive a raw event for the onDragRelease
        if (layout.target) {
          this.props.onGestureComplete()
          return
        }

        this.container.setNativeProps({
          style: this.props.toStyle(layout)
        })
      },
      (err) => this.props.onError(err)
    )
  },

  componentWillUnmount() {
    if (this.subscription != null) {
      this.subscription.dispose()
    }
  },

  render () {
    let props = {
      ref: (container) => this.container = container,
      style: this.props.style,
      onLayout: ({nativeEvent}) => {
        this.onLayout.onNext(nativeEvent)
      },
      type: this.props.type || 'View',
      source: this.props.source,
      ...this.gestureResponder.panHandlers
    }
    return (
      <View>
        {this.props.type === 'View' ? (
          <View {...props}>
            {this.props.children}
          </View>
        ) : (
          <Image {...props} />
        )}
      </View>
    )
  }
})
