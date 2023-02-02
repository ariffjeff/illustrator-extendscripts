// Repeat the bleed of a selection enough for printing and cutting

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// CLIP MASKS IN SELECTION OUTSIDE DESIRED bleed BREAK PROCEDURE

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  if(selection.length < 1) {
    alert("Select at least one object to extend bleed.")
    return
  }
  
  sourceDoc = activeDocument
  artObject = sourceDoc.selection[0]
  
  bleed = {
    top: artObject.duplicate(),
    bottom: artObject.duplicate(),
    left: artObject.duplicate(),
    right: artObject.duplicate(),
    corners: artObject.duplicate()
  }
  
  bleed.top.name = "bleed_top"
  bleed.bottom.name = "bleed_bottom"
  bleed.left.name = "bleed_left"
  bleed.right.name = "bleed_right"
  bleed.corners.name = "bleed_corners"
  
  bleed.top.resize(100,-100)
  bleed.top.position = [bleed.top.position[0], bleed.top.position[1] + bleed.top.height]
  bleed.bottom.resize(100,-100)
  bleed.bottom.position = [bleed.bottom.position[0], bleed.bottom.position[1] - bleed.bottom.height]
  bleed.left.resize(-100,100)
  bleed.left.position = [bleed.left.position[0] - bleed.left.width, bleed.left.position[1]]
  bleed.right.resize(-100,100)
  bleed.right.position = [bleed.right.position[0] + bleed.right.width, bleed.right.position[1]]
  bleed.corners.resize(102,102)
  bleed.corners.zOrder(ZOrderMethod.SENDBACKWARD)
  
  cornersTemp = bleed.corners.duplicate()
  cornersTemp.stroked = false
  clipMask = sourceDoc.activeLayer.pathItems.rectangle(cornersTemp.top, cornersTemp.left, cornersTemp.width, cornersTemp.height)
  cornersTemp.remove()
  clipMask.name = "clipMask"
  
  selectionTemp = selection
  selectionTemp.push(clipMask)
  selection = selectionTemp
  
  redraw()
  executeMenuCommand('makeMask')
}

function filter_array(arr) {
  var index = -1,
  arr_length = arr ? arr.length : 0,
  resIndex = -1,
  result = []
  
  while (++index < arr_length) {
    var value = arr[index]
    if (value) result[++resIndex] = value
  }
  return result
}

function arrayOffset(arr0, arr1, op) {
  if(arr0.length == arr1.length) {
    var arrTemp = []
    for(var i = 0; i < arr0.length; i++) {
      switch(op) {
        case "add":
        arrTemp[i] = arr0[i] + arr1[i];
        break;
        case "sub":
        arrTemp[i] = arr0[i] - arr1[i];
        break;
        case "mult":
        arrTemp[i] = arr0[i] * arr1[i];
        break;
        case "div":
        arrTemp[i] = arr0[i] / arr1[i];
      }
    }
    return arrTemp
  } else {
    throw EvalError("Array lengths differ")
  }
}

function bbox(obj) {
  if(obj instanceof Array) { // single or multiple objects
    var bbox = {
      top: obj[0].edge_T, // absolute
      bottom: obj[0].edge_B, // absolute
      left: obj[0].edge_L, // absolute
      right: obj[0].edge_R // absolute
    }
    
    for(var i = 0; i < obj.length; i++) {
      bbox.top = Math.max(obj[i].edge_T, bbox.top) // absolute
      bbox.bottom = Math.min(obj[i].edge_B, bbox.bottom) // absolute
      bbox.left = Math.min(obj[i].edge_L, bbox.left) // absolute
      bbox.right = Math.max(obj[i].edge_R, bbox.right) // absolute
    }
  } else {
    var bbox = {
      top: obj.top, // absolute
      bottom: obj.top - obj.height, // absolute
      left: obj.left, // absolute
      right: obj.left + obj.width // absolute
    }
  }
  
  bbox.center = [((bbox.right - bbox.left) / 2) + bbox.left,
    ((bbox.top - bbox.bottom) / 2) + bbox.bottom
  ]

  return bbox
}
