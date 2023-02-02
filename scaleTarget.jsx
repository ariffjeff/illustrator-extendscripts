#include "jsx_modules.jsx"

// Quickly scale an image or anything else to exact dimensions using a reference object.

// How to:
// Group the artwork you want to scale.
// Create a rectangle and place it over, and size it to, the 
// section of the artwork that will be used for scale reference.
// This rectangle will be the temporary clipping mask.
// Make sure the rectangle is above the grouped artwork.
// Finally select both the artwork and the rectangle then run the script.

// Limitation: 
// Target cannot be placed back into its original Z order position in the Layers hierarchy when
// there are sub layers present within the target's parent layer. This is due to the fact that
// there is no way to iterate over pageItems and layers in order simultaneously.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// DOESN'T WORK FOR REGULAR MASKS

// BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  sourceDoc = activeDocument
  
  if(sourceDoc.selection.length < 2 || sourceDoc.selection.length > 2) {
    alert("Exactly 2 objects must be selected:\n\
    1: The target object(s) you want to scale.\
    2: A reference box, above the target(s), to drive the scaling.\n\nIf you need to scale multiple target objects then group them first.");
    return
  }
  artObjects = {
    "clipMask": selection[0],
    "target": selection[1]
  }
  var finalZOrderPosition = getTrueZOrderPosition(artObjects.target)
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  var scaleMultiplier = dialog_scaleToTarget(artObjects.target, artObjects.clipMask, docUnits)
  if(scaleMultiplier == false) return
  executeMenuCommand("makeMask")
  artObjects.target.parent.resize(scaleMultiplier[0] * 100, scaleMultiplier[1] * 100, true, true, true, true, Math.max(scaleMultiplier[0], scaleMultiplier[1]) * 100, undefined)
  executeMenuCommand("releaseMask")
  artObjects.clipMask.remove()
  
  // put target back to original Z order position
  if(finalZOrderPosition != false) { // impossible to iterate over layers and pageItems simultaneously. (just give up on existence of sub layers)
    var i = 0
    while(i < finalZOrderPosition - 1) { // -1 accounts for existence of artObjects.clipMask
      artObjects.target.zOrder(ZOrderMethod.SENDBACKWARD)
      i++
    }
  }
}

// get true Z order position of any item relative to its parent layer since built-in Illustrator Z order properties are unreliable
function getTrueZOrderPosition(targetItem) {
  var i = 0
  var targetLayer = artObjects.target.layer
  
  // impossible to iterate over layers and pageItems simultaneously. (just give up on existence of sub layers)
  if(targetLayer.layers.length > 0) return false
  
  while(true) {
    if(targetLayer.pageItems[i] == targetItem) return i
    i++
  }
}

// scale target item according to reference clipMask's scale
function dialog_scaleToTarget(target, clipMask, docUnits) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":23,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"scaleToTarget","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Scale item to target size","preferredSize":[0,0],"margins":16,"orientation":"row","spacing":30,"alignChildren":["center","fill"]}},"item-7":{"id":7,"type":"Group","parentId":13,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","fill"],"alignment":null}},"item-8":{"id":8,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Width:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Group","parentId":13,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","fill"],"alignment":null}},"item-11":{"id":11,"type":"StaticText","parentId":10,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Height:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-13":{"id":13,"type":"Group","parentId":31,"style":{"enabled":true,"varName":"grp_current","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","top"],"alignment":null}},"item-14":{"id":14,"type":"StaticText","parentId":13,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Original Dimensions","justify":"left","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-15":{"id":15,"type":"Group","parentId":31,"style":{"enabled":true,"varName":"grp_target","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-16":{"id":16,"type":"StaticText","parentId":15,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Target Dimensions","justify":"left","preferredSize":[0,0],"alignment":"center","helpTip":null}},"item-17":{"id":17,"type":"Group","parentId":15,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","fill"],"alignment":null}},"item-18":{"id":18,"type":"StaticText","parentId":17,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Width:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-19":{"id":19,"type":"EditText","parentId":17,"style":{"enabled":true,"varName":"t_w","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"w","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-20":{"id":20,"type":"Group","parentId":15,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","fill"],"alignment":null}},"item-21":{"id":21,"type":"StaticText","parentId":20,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Height:","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-22":{"id":22,"type":"EditText","parentId":20,"style":{"enabled":true,"varName":"t_h","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"h","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-23":{"id":23,"type":"Button","parentId":25,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[0,35],"alignment":null,"helpTip":null}},"item-24":{"id":24,"type":"Button","parentId":25,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[86,35],"alignment":null,"helpTip":null}},"item-25":{"id":25,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"usrBtns","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["fill","center"],"alignment":null}},"item-27":{"id":27,"type":"StaticText","parentId":10,"style":{"enabled":true,"varName":"c_h","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"h in","justify":"left","preferredSize":[80,23],"alignment":null,"helpTip":null}},"item-29":{"id":29,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"c_w","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"w in","justify":"left","preferredSize":[80,23],"alignment":null,"helpTip":null}},"item-30":{"id":30,"type":"Checkbox","parentId":32,"style":{"enabled":true,"varName":"uniScale","text":"Uniform Scale","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-31":{"id":31,"type":"Group","parentId":32,"style":{"enabled":true,"varName":"dims","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":50,"alignChildren":["left","center"],"alignment":null}},"item-32":{"id":32,"type":"Group","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-33":{"id":33,"type":"StaticText","parentId":17,"style":{"enabled":true,"varName":"t_unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-34":{"id":34,"type":"StaticText","parentId":20,"style":{"enabled":true,"varName":"t_unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,32,30,31,15,16,17,18,19,33,20,21,22,34,13,14,7,8,29,10,11,27,25,24,23],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  clipMaskWidthTemp = clipMask.width / docUnits.multiplier
  clipMaskHeightTemp = clipMask.height / docUnits.multiplier
  
  // SCALETOTARGET
  // =============
  var scaleToTarget = new Window("dialog"); 
  scaleToTarget.text = "Scale item to target dimensions"; 
  scaleToTarget.orientation = "row"; 
  scaleToTarget.alignChildren = ["center","fill"]; 
  scaleToTarget.spacing = 30; 
  scaleToTarget.margins = 16; 
  
  // GROUP1
  // ======
  var group1 = scaleToTarget.add("group", undefined, {name: "group1"}); 
  group1.orientation = "column"; 
  group1.alignChildren = ["center","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var uniScale = group1.add("checkbox", undefined, undefined, {name: "uniScale"}); 
  uniScale.text = "Uniform Scale"; 
  uniScale.value = true; 
  
  // DIMS
  // ====
  var dims = group1.add("group", undefined, {name: "dims"}); 
  dims.orientation = "row"; 
  dims.alignChildren = ["left","center"]; 
  dims.spacing = 50; 
  dims.margins = 0; 
  
  // GRP_TARGET
  // ==========
  var grp_target = dims.add("group", undefined, {name: "grp_target"}); 
  grp_target.orientation = "column"; 
  grp_target.alignChildren = ["right","center"]; 
  grp_target.spacing = 10; 
  grp_target.margins = 0; 
  
  var statictext1 = grp_target.add("statictext", undefined, undefined, {name: "statictext1"}); 
  statictext1.text = "Target Dimensions"; 
  statictext1.alignment = ["center","center"]; 
  
  // GROUP2
  // ======
  var group2 = grp_target.add("group", undefined, {name: "group2"}); 
  group2.orientation = "row"; 
  group2.alignChildren = ["left","fill"]; 
  group2.spacing = 10; 
  group2.margins = 0; 
  
  var statictext2 = group2.add("statictext", undefined, undefined, {name: "statictext2"}); 
  statictext2.text = "Width:"; 
  
  var t_w = group2.add('edittext {properties: {name: "t_w"}}'); 
  t_w.text = prec(clipMaskWidthTemp, 4)
  t_w.preferredSize.width = 80; 
  t_w.active = true
  
  var t_unit = group2.add("statictext", undefined, undefined, {name: "t_unit"}); 
  t_unit.text = docUnits.unit_short; 
  
  // GROUP3
  // ======
  var group3 = grp_target.add("group", undefined, {name: "group3"}); 
  group3.orientation = "row"; 
  group3.alignChildren = ["left","fill"]; 
  group3.spacing = 10; 
  group3.margins = 0; 
  
  var statictext3 = group3.add("statictext", undefined, undefined, {name: "statictext3"}); 
  statictext3.text = "Height:"; 
  
  var t_h = group3.add('edittext {properties: {name: "t_h"}}'); 
  t_h.text = prec(clipMaskHeightTemp, 4)
  t_h.preferredSize.width = 80; 
  
  var t_unit1 = group3.add("statictext", undefined, undefined, {name: "t_unit1"}); 
  t_unit1.text = docUnits.unit_short; 
  
  // GRP_CURRENT
  // ===========
  var grp_current = dims.add("group", undefined, {name: "grp_current"}); 
  grp_current.orientation = "column"; 
  grp_current.alignChildren = ["right","top"]; 
  grp_current.spacing = 10; 
  grp_current.margins = 0; 
  
  var statictext4 = grp_current.add("statictext", undefined, undefined, {name: "statictext4"}); 
  statictext4.text = "Original Dimensions"; 
  statictext4.alignment = ["center","top"]; 
  
  // GROUP4
  // ======
  var group4 = grp_current.add("group", undefined, {name: "group4"}); 
  group4.orientation = "row"; 
  group4.alignChildren = ["left","fill"]; 
  group4.spacing = 10; 
  group4.margins = 0; 
  
  var statictext5 = group4.add("statictext", undefined, undefined, {name: "statictext5"}); 
  statictext5.text = "Width:"; 
  
  var c_w = group4.add("statictext", undefined, undefined, {name: "c_w"}); 
  c_w.text = prec(clipMaskWidthTemp, 4) + " " + docUnits.unit_short; 
  c_w.preferredSize.width = 80; 
  c_w.preferredSize.height = 23; 
  
  // GROUP5
  // ======
  var group5 = grp_current.add("group", undefined, {name: "group5"}); 
  group5.orientation = "row"; 
  group5.alignChildren = ["left","fill"]; 
  group5.spacing = 10; 
  group5.margins = 0; 
  
  var statictext6 = group5.add("statictext", undefined, undefined, {name: "statictext6"}); 
  statictext6.text = "Height:"; 
  
  var c_h = group5.add("statictext", undefined, undefined, {name: "c_h"}); 
  c_h.text = prec(clipMaskHeightTemp, 4) + " " + docUnits.unit_short; 
  c_h.preferredSize.width = 80; 
  c_h.preferredSize.height = 23; 
  
  // USRBTNS
  // =======
  var usrBtns = scaleToTarget.add("group", undefined, {name: "usrBtns"}); 
  usrBtns.orientation = "column"; 
  usrBtns.alignChildren = ["fill","center"]; 
  usrBtns.spacing = 10; 
  usrBtns.margins = 0; 
  
  var cancel = usrBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 86; 
  cancel.preferredSize.height = 35; 
  
  var ok = usrBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.height = 35;
  if(isNaN(clipMaskWidthTemp) || isNaN(clipMaskHeightTemp)) {
    ok.enabled = false; 
  } else {
    ok.enabled = true; 
  }
  
  // -----------------------------------------------------------------------------------
  
  var t_h_bool = t_w_bool = false // user entered bad input
  
  t_w.onChanging = function() {
    var scaleGoal = t_w.text / clipMaskWidthTemp
    if(uniScale.value) t_h.text = prec(clipMaskHeightTemp * scaleGoal, 4)
    t_w_bool = isNaN(Number(t_w.text)) || Number(t_w.text) == Infinity || Number(t_w.text) == 0
    if(t_w_bool) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  t_h.onChanging = function() {
    var scaleGoal = t_h.text / clipMaskHeightTemp
    if(uniScale.value) t_w.text = prec(clipMaskWidthTemp * scaleGoal, 4)
    t_h_bool = isNaN(Number(t_h.text)) || Number(t_h.text) == Infinity || Number(t_h.text) == 0
    if(t_h_bool) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  // reset one of the inputs
  uniScale.onClick = function() {
    var scaleGoal = Number(t_w.text) / clipMaskWidthTemp
    t_h.text = prec(clipMaskHeightTemp * scaleGoal, 4)
    if(t_w_bool || t_h_bool) {
      ok.enabled = false
    } else {
      ok.enabled = true
    }
  }
  
  // -----------------------------------------------------------------------------------
  
  var choice = scaleToTarget.show();
  
  switch (choice) {
    case 1: // continue
    return [prec(Number(t_w.text) / clipMaskWidthTemp, 4), prec(Number(t_h.text) / clipMaskHeightTemp, 4)]
    
    case 2: // cancel
    return false
    
    default:
    break;
  }
}
