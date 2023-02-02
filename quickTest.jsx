#include "jsx_modules.jsx"

// Script for testing ExtendScript
// Use the extendscript-debug debugger

// BridgeTalk.bringToFront("illustrator")
main()


function main() {
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  var sourceDoc = activeDocument
  var artObjects = sourceDoc.selection
  
  var scaleMult = 100
  for (i = 0; i < artObjects.length; i++) {
    scaleMult = 24.25 * 72 / artObjects[i].width * 100
    artObjects[i].resize(scaleMult, scaleMult, true, true, true, true, undefined, Transformation.CENTER);
  }
}
