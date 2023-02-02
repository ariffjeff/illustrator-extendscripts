// Forces compound paths to be released into their individual paths when the option sometimes is not shown to the user.
// The option typically disappears when compound items are selected with non-compoound items even though the user may
// still want to release any compound items in the selection.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  executeMenuCommand('noCompoundPath')
}
