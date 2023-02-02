#include "jsx_modules.jsx"

// Converts stroked live text into cut lines. Also works on non-stroked live text.
// Try to avoid using this script when strokes overlap onto adjacent letters as undesirable artifacts in the final cut lines often will be produced.
// Precision is reduced when script is run on small text. Slight offsets occur to some anchors of some paths. Run script on 1:1 scaled text for best results.
// This script has the added benefit of creating outputs that are single compound paths which are much easier to use in some pathfinder operations.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  sourceDoc = activeDocument
  
  var targetSelection = []
  var originalSelection = []
  for(var i = 0; i < selection.length; i++) {
    originalSelection.push(selection[i])
  }
  
  for(var i = 0; i < sourceDoc.textFrames.length; i++) {
    if(sourceDoc.textFrames[i].selected) {
      targetSelection.push(sourceDoc.textFrames[i])
      var spliceIndex = Array.indexOf(originalSelection, sourceDoc.textFrames[i])
      if(spliceIndex != -1) originalSelection.splice(spliceIndex, 1)
    }
  }
  
  if(targetSelection.length == 0) {
    alert("Selection must contain live text.")
    return
  }
  
  var base = targetSelection
  var top = []
  var top_stroke = []
  var textSelection = []
  for(var i = 0; i < base.length; i++) {
    var finalName = base[i].name
    top[i] = base[i].duplicate()
    top_stroke[i] = top[i].duplicate()
    
    base[i].textRange.fillColor = base[i].textRange.strokeColor
    base[i] = expand(base[i])
    pathfinder_unite()
    base[i] = selection[0]
    
    top[i].textRange.strokeWeight = 0
    expand(top[i])
    executeMenuCommand('ungroup')
    executeMenuCommand('noCompoundPath')
    executeMenuCommand('compoundPath')
    top[i] = selection[0]
    
    top_stroke[i].textRange.fillColor = new NoColor()
    top_stroke[i] = expand(top_stroke[i])
    executeMenuCommand('noCompoundPath')
    executeMenuCommand('compoundPath')
    selection = [top[i], top_stroke[i]]
    
    pathfinder_minusFront()
    top[i] = selection[0]
    
    selection = [base[i], top[i]]
    executeMenuCommand('group')
    selection[0].name = finalName
    
    textSelection.push(selection[0])
  }
  
  if(originalSelection.length <= 40) { // ai is very slow to add lots of new items to selection
    selection = textSelection.concat(originalSelection)
  } else {
    selection = textSelection
  }
}

// expands live text and strokes
function expand(obj) {
  obj = obj.createOutline()
  selection = obj
  executeMenuCommand('OffsetPath v22')
  return selection[0]
}

function pathfinder_minusFront() {
  executeMenuCommand('group')
  executeMenuCommand('Live Pathfinder Subtract')
  executeMenuCommand('expandStyle')
  selection[0].position = selection[0].position // pseudo redraw() without adding to undo stack
}

function pathfinder_unite() {
  executeMenuCommand('Live Pathfinder Add')
  executeMenuCommand('expandStyle')
}
