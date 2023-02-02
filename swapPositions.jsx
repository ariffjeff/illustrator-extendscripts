#include "jsx_modules.jsx"

// Swaps the positions of two objects.

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.")
    return
  }
  sourceDoc = activeDocument
  
  if(selection.length != 2) {
    alert("Two objects must be selected in order to swap their positions.")
    return
  }
  
  savePos0 = getCenter(selection[0]) 
  savePos1 = getCenter(selection[1]) 

  // offset position to account for centering
  savePos0[0] -= selection[1].width / 2
  savePos0[1] += selection[1].height / 2
  savePos1[0] -= selection[0].width / 2
  savePos1[1] += selection[0].height / 2

  selection[0].position = savePos1
  selection[1].position = savePos0
}
