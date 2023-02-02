#include "jsx_modules.jsx"

// Reverses the Z order of selected items

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// BridgeTalk.bringToFront("illustrator")
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  var sourceDoc = activeDocument
  
  if(selection == 0) {
    return
  }
  var artObjects = selection
  
  // record artObjects by layer
  var layers = {}
  var layerIdx
  for(var i = 0; i < artObjects.length; i++) {
    layerIdx = artObjects[i].layer.zOrderPosition
    if(layers[layerIdx] == undefined) {
      layers[layerIdx] = []
    }
    layers[layerIdx].push(artObjects[i])
  }
  
  if(Object.size(layers) > 1) {
    alert("Cannot reverse objects over multiple layers.")
    return
  }
  
  var map = mapZOrder(artObjects)
  reverseOrder(artObjects, map)
}

// top down in layer hierarchy
function mapZOrder(objs) {
  var map = []
  for(var i = 0; i < objs.length; i++) {
    try {
      map.push(objs[i].zOrderPosition)
    } catch (error) {
      try {
        if(error.message == "Internal error") {
          map.push(-1) // last pageItem is -1 Z position for some reason
        }
      } catch (error) {
        return alert("Internal error with Z ordering")
      }
    }
  }
  return map
}

function reverseOrder(objs, map) {
  var range = map[0] - map[map.length - 1]
  for(var i = 0; i < objs.length; i++) { 
    for(var pos = 0; pos < range - i; pos++) {
      objs[i].zOrder(ZOrderMethod.SENDBACKWARD)
    }
  }
}
