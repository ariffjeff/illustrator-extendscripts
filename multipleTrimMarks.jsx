// Adds trim marks over every selected object.
// Exactly the same as doing Object > Create Trim Marks except it doesn't allow per object.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// OPTION TO DELETE INNER MARKS

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  if(selection.length < 1) {
    alert("Select objects to create multiple sets of trim marks.")
    return
  }
  artObjects = selection
  
  for(var i = 0; i < artObjects.length; i++) {
    selection = artObjects[i]
    executeMenuCommand('TrimMark v25');
  }
  
  selection = artObjects
}
