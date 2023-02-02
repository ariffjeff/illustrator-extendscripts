#include "jsx_modules.jsx"

// Move active artboard to the near corner of the canvas to get it out of the way,
// or delete it if it is already at that position.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// AFTER ARTBOARD IS DETECTED TO BE IN CANVAS, TRY TO PUSH DOWN OR LEFT ONE AXIS AT A TIME TO GET TO BL CORNER

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }

  var sourceDoc = activeDocument
  var targetArtboard = sourceDoc.artboards[sourceDoc.artboards.getActiveArtboardIndex()]
  var targetRect = [-8000, -8000, -7900, -8100] // left, top, right, bottom // arbitrary bottom-left area of the canvas
  
  if(sourceDoc.artboards.length > 1) {
    targetArtboard.remove()
    return
  }
  
  var walkRate = 50
  try {
    targetArtboard.artboardRect = targetRect
    walkArtboardOutwards(targetArtboard, targetRect, -walkRate)
  } catch (err) {
    walkArtboardInwards(targetArtboard, targetRect, walkRate)
  }
}

// try to position artboard as far left-downwards as possible on the canvas by walking left-downwards
function walkArtboardOutwards(targetArtboard, targetRect, walkRate) {
  var walkDist = walkRate
  var tempPosition
  while(true) {
    try {
      targetArtboard.artboardRect = [targetRect[0] + walkDist, targetRect[1] + walkDist, targetRect[2] + walkDist, targetRect[3] + walkDist]
      tempPosition = targetArtboard.artboardRect // workaround for document not updating / redraw() bug
      walkDist += walkRate
    } catch (err) {
      targetArtboard.artboardRect = tempPosition // workaround for document not updating / redraw() bug
      break
    }
  }
}

// try to position artboard as far left-downwards as possible on the canvas by walking right-upwards
function walkArtboardInwards(targetArtboard, targetRect, walkRate) {
  var walkDist = walkRate
  while(true) {
    try {
      targetArtboard.artboardRect = [targetRect[0] + walkDist, targetRect[1] + walkDist, targetRect[2] + walkDist, targetRect[3] + walkDist]
      break
    } catch (err) {
      walkDist += walkRate
    }
  }
}
