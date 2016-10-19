import curry from 'curry'

function createGesture (responder, transducer, getInitialLayout, draggable) {
  return draggable
    .onDragStart
    .flatMap(function () {
      return responder(
        draggable.onDragMove,
        getInitialLayout
      )
      .transduce(transducer)
      .takeUntil(draggable.onDragRelease)
      // TODO: This is giving us two onDragRelease events for some reason
      // onPanResponderRelease gives only one event, so there's a problem with this stream somewhere
      .merge(draggable.onDragRelease.first())
    })
};

export default curry(createGesture)
