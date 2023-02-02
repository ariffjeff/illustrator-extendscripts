#include "jsx_modules.jsx"

// Quickly duplicate items. Is also able to respect duplicating to same layer per item which Illustrator doesn't do with copy/paste.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

// TODO:
// OPTIONS TO DUPLICATE TO ANY NUMBER, IN A LINE/GRID + SPACING - like C4D cloner tool

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  var sourceDoc = activeDocument
  
  if(selection == 0) return
  var artObjects = selection
  
  var cloner = dialog_quickDuplicate()
  if(cloner === false) return
  
  var targetLayer
  if(cloner.respectLayers) {
    targetLayer = firstAvailableLayer()
  } else {
    targetLayer = sourceDoc.activeLayer
  }
  
  var duplicates = []
  for(var i = 0; i < artObjects.length; i++) {
    for(var clone = 0; clone < cloner.num; clone++) {
      duplicates.push(artObjects[i].duplicate(targetLayer))
    }
  }
  
  if(cloner.selectClones) {
    selection = duplicates
  } else {
    selection = artObjects
  }
}

function dialog_quickDuplicate() {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":7,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"cloner","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Cloner","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":15,"alignChildren":["center","top"]}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"useBtns","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-5":{"id":5,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[85,30],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[85,30],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Checkbox","parentId":9,"style":{"enabled":true,"varName":"selectClones","text":"Select clones","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-8":{"id":8,"type":"Checkbox","parentId":9,"style":{"enabled":true,"varName":"respectLayers","text":"Create on first available layer","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-9":{"id":9,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"grp_options","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":15,"alignChildren":["left","center"],"alignment":null}},"item-10":{"id":10,"type":"Group","parentId":9,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-11":{"id":11,"type":"StaticText","parentId":10,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Clones","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-12":{"id":12,"type":"EditText","parentId":10,"style":{"enabled":true,"varName":"num","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"1","justify":"left","preferredSize":[65,0],"alignment":null,"helpTip":null}}},"order":[0,9,10,11,12,7,8,4,5,6],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // CLONER
  // ======
  var cloner = new Window("dialog"); 
  cloner.text = "Cloner"; 
  cloner.orientation = "column"; 
  cloner.alignChildren = ["center","top"]; 
  cloner.spacing = 15; 
  cloner.margins = 16; 
  
  // GRP_OPTIONS
  // ===========
  var grp_options = cloner.add("group", undefined, {name: "grp_options"}); 
  grp_options.orientation = "column"; 
  grp_options.alignChildren = ["left","center"]; 
  grp_options.spacing = 15; 
  grp_options.margins = 0; 
  
  // GROUP1
  // ======
  var group1 = grp_options.add("group", undefined, {name: "group1"}); 
  group1.orientation = "row"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var label = group1.add("statictext", undefined, undefined, {name: "label"}); 
  label.text = "Clones"; 
  
  var num = group1.add('edittext {properties: {name: "num"}}'); 
  num.text = "1"; 
  num.preferredSize.width = 65; 
  // num.active = true
  
  // GRP_OPTIONS
  // ===========
  var selectClones = grp_options.add("checkbox", undefined, undefined, {name: "selectClones"}); 
  selectClones.text = "Select clones"; 
  selectClones.value = true; 
  
  var respectLayers = grp_options.add("checkbox", undefined, undefined, {name: "respectLayers"}); 
  respectLayers.text = "Create on first available layer"; 
  
  // USEBTNS
  // =======
  var useBtns = cloner.add("group", undefined, {name: "useBtns"}); 
  useBtns.orientation = "row"; 
  useBtns.alignChildren = ["left","center"]; 
  useBtns.spacing = 10; 
  useBtns.margins = 0; 
  
  var ok = useBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 85; 
  ok.preferredSize.height = 30; 
  
  var cancel = useBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 85; 
  cancel.preferredSize.height = 30; 
  
  var choice = cloner.show();
  if(choice == 2) return false
  
  return {
    num: Number(num.text),
    selectClones: selectClones.value, 
    respectLayers: respectLayers.value
  }
}
