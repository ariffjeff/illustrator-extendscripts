#include "jsx_modules.jsx"

// Adds a text item to the current document to define working scale.
// Helps drive getDimensions.jsx and any other scripts that use document scale.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  
  var xmlConfig = getXMLConfig()
  var docScaleID = xmlConfig.xml.docScale.textFrameIdentifier.toString()
  sourceDoc = activeDocument
  
  var targetLayer = firstAvailableLayer()
  if(targetLayer == false) {
    alert("No visible and unlocked layer available.")
    return
  }
  
  var docScale = dialog_setScaleText(false)
  if(docScale == false) return
  var workingScaleText = targetLayer.textFrames.add();
  workingScaleText.name = docScaleID
  workingScaleText.contents = docScale.docScale.toString().concat(" scale")
  workingScaleText.textRange.characterAttributes.size = 144
  workingScaleText.position = sourceDoc.views[0].centerPoint
  workingScaleText.left -= workingScaleText.width / 2

  if(docScale.selectText) {
    selection = workingScaleText
  }
}

function dialog_setScaleText(err_enterValidNum) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":10,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"setDocScale","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Set document working scale","preferredSize":[0,0],"margins":20,"orientation":"column","spacing":15,"alignChildren":["center","top"]}},"item-2":{"id":2,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[80,30],"alignment":null,"helpTip":null}},"item-3":{"id":3,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[80,30],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[80,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-5":{"id":5,"type":"EditText","parentId":7,"style":{"enabled":true,"varName":"docScale","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":".1","justify":"right","preferredSize":[60,0],"alignment":null,"helpTip":""}},"item-6":{"id":6,"type":"StaticText","parentId":7,"style":{"enabled":true,"varName":"","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Doc scale","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Group","parentId":8,"style":{"enabled":true,"varName":"docScaleGrp","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-8":{"id":8,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"options","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-9":{"id":9,"type":"StaticText","parentId":0,"style":{"enabled":true,"varName":"errorMsg","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Enter a valid number.","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Checkbox","parentId":8,"style":{"enabled":true,"varName":"selectText","text":"Select","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}}},"order":[0,8,7,6,5,10,9,4,3,2],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // SETDOCSCALE
  // ===========
  var setDocScale = new Window("dialog", undefined, undefined, {closeButton: false}); 
  setDocScale.text = "Set document working scale"; 
  setDocScale.orientation = "column"; 
  setDocScale.alignChildren = ["center","top"]; 
  setDocScale.spacing = 15; 
  setDocScale.margins = 20; 
  
  // OPTIONS
  // =======
  var options = setDocScale.add("group", undefined, {name: "options"}); 
  options.orientation = "column"; 
  options.alignChildren = ["left","center"]; 
  options.spacing = 10; 
  options.margins = 0; 
  
  // DOCSCALEGRP
  // ===========
  var docScaleGrp = options.add("group", undefined, {name: "docScaleGrp"}); 
  docScaleGrp.orientation = "row"; 
  docScaleGrp.alignChildren = ["left","center"]; 
  docScaleGrp.spacing = 10; 
  docScaleGrp.margins = 0; 
  
  var statictext1 = docScaleGrp.add("statictext", undefined, undefined, {name: "statictext1"}); 
  statictext1.text = "Document scale"; 
  
  var docScale = docScaleGrp.add('edittext {justify: "right", properties: {name: "docScale"}}'); 
  docScale.text = ".1"; 
  docScale.preferredSize.width = 60; 
  // docScale.active = true // causes window focus flickering when script is run from scriptPanel.jsx
  
  // OPTIONS
  // =======
  var selectText = options.add("checkbox", undefined, undefined, {name: "selectText"}); 
  selectText.text = "Select"; 
  selectText.value = true; 
  
  // SETDOCSCALE
  // ===========
  if(err_enterValidNum) {
    var errorMsg = setDocScale.add("statictext", undefined, undefined, {name: "errorMsg"}); 
    errorMsg.text = "Enter a valid number."; 
  }
  
  // USERBTNS
  // ========
  var userBtns = setDocScale.add("group", undefined, {name: "userBtns"}); 
  userBtns.preferredSize.width = 80; 
  userBtns.orientation = "row"; 
  userBtns.alignChildren = ["left","top"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 80; 
  cancel.preferredSize.height = 30; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 80; 
  ok.preferredSize.height = 30; 
  
  var choice = setDocScale.show();
  if(choice == 2) return false
  
  var num = Number(docScale.text)
  if(isNaN(num) || num == 0 || num == Infinity) {
    return dialog_setScaleText(true)
  }
  
  return {
    docScale: num,
    selectText: selectText.value
  }
}
