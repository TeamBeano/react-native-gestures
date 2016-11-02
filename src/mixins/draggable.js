import Rx from 'rx'
import create from '../create'
import { PanResponder } from 'react-native'

function yes () { return true }

export default function draggableMixin (gestureDefs = []) {
  return {
    target: null,
    layout: null,
    gestureDefs: null,

    getInitialLayout() {
      return this.layout
    },

    isCurrentTarget(ev) {
      return ev.target === this.target
    },

    componentWillMount () {
      let onDragStart = new Rx.Subject()
      let onDragMove = new Rx.Subject()
      let onDragRelease = new Rx.Subject()

      this
        .onLayout
        .take(1)
        .subscribe(ev => this.target = ev.target)

      this
        .onLayout
        .subscribe(ev => this.layout = ev.layout)

      let draggable = {
        onDragStart: onDragStart.filter(this.isCurrentTarget),
        onDragMove: onDragMove.filter(this.isCurrentTarget),
        onDragRelease: onDragRelease.filter(this.isCurrentTarget)
      }

      this.gestureResponder = PanResponder.create({
        onStartShouldSetPanResponder: yes,
        onStartShouldSetPanResponderCapture: yes,
        onMoveShouldSetPanResponder: yes,
        onMoveShouldSetPanResponderCapture: yes,
        onPanResponderGrant: (evt) => onDragStart.onNext(evt.nativeEvent),
        onPanResponderMove: (evt, gestureState) => onDragMove.onNext(evt.nativeEvent),
        onPanResponderTerminationRequest: yes,
        onPanResponderRelease: (evt) => onDragRelease.onNext(evt.nativeEvent),
        onPanResponderTerminate: yes,
        onShouldBlockNativeResponder: yes
      })

      if (this.props && this.props.gestures) {
        this.gestureDefs = gestureDefs.concat(this.props.gestures)
      } else {
        this.gestureDefs = gestureDefs
      }

      this.layoutStream = Rx
        .Observable
        .merge(this.gestureDefs.map(def =>
          create(def.responder, def.transducer, this.getInitialLayout, draggable)))
    },
  }
}
