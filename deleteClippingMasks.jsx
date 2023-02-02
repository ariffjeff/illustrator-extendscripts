// Attempts to delete all clipping masks.

// no selection: delete all clipping masks in document
// selection: delete all clipping masks in current selection

// sometimes does not remove a lone object from its ex-clipping mask group which can leave behind an
// unnecessarily messy layer hierarchy. Any clipping masks will still be deleted, though.

// if you run this script and then want to undo any changes then you will need to undo twice due to an Illustrator bug.
// redraw() works around the bug at the cost of adding to the undo stack.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  if(!activeDocument.pageItems.length > 0) {
    alert("There are no items in the document.");
    return
  }
  
  if(activeDocument.selection.length == 0) {
    executeMenuCommand('deselectall')
    executeMenuCommand('Clipping Masks menu item')
    executeMenuCommand('clear')
  } else {
    var originalSelection = selection
    var initialUUID = selection[0].uuid
    executeMenuCommand('group')
    var targetUUID = selection[0].uuid
    executeMenuCommand('deselectall')
    executeMenuCommand('Clipping Masks menu item')
    var allClipMasks = selection
    
    for(var i = 0; i < allClipMasks.length; i++) {
      var level = allClipMasks[i]
      while(true) {
        if(level.typename == "Layer") {
          break
        } else if(level.parent.uuid == targetUUID) {
          allClipMasks[i].remove()
          break
        } else {
          level = level.parent
        }
      }
    }
    
    redraw() // can't ungroup single item/groups otherwise
    
    selection = originalSelection
    // preserve top GroupItem if it was original top GroupItem
    if(initialUUID != targetUUID) {
      executeMenuCommand('ungroup')
    }
    
    // ungroup top level groups containing single item/group
    originalSelection = selection
    for(var i = 0; i < originalSelection.length; i++) {
      if(originalSelection[i].typename == "GroupItem" && originalSelection[i].pageItems.length == 1) {
        selection = originalSelection[i]
        executeMenuCommand('ungroup')
      }
    }
    executeMenuCommand('deselectall')
  }
}
