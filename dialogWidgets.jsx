// ScriptUI user dialog modules

/**
 * Grid of radio buttons that act as a transform reference point selector. 
 * @param {object} container
 * ScriptUI container to add widget to.
 * @returns {object}
 */
function widget_referencePoint(container) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":1,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"refPoint","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":true,"borderless":false,"resizeable":false},"text":"Reference Point","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":null,"creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Reference","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["right","center"],"alignment":null}},"item-2":{"id":2,"type":"Group","parentId":1,"style":{"enabled":true,"varName":"grp_t","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-3":{"id":3,"type":"RadioButton","parentId":2,"style":{"enabled":true,"varName":"tl","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"RadioButton","parentId":2,"style":{"enabled":true,"varName":"t","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"RadioButton","parentId":2,"style":{"enabled":true,"varName":"tr","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-10":{"id":10,"type":"Group","parentId":1,"style":{"enabled":true,"varName":"grp_m","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-11":{"id":11,"type":"RadioButton","parentId":10,"style":{"enabled":true,"varName":"l","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-12":{"id":12,"type":"RadioButton","parentId":10,"style":{"enabled":true,"varName":"m","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-13":{"id":13,"type":"RadioButton","parentId":10,"style":{"enabled":true,"varName":"r","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-14":{"id":14,"type":"Group","parentId":1,"style":{"enabled":true,"varName":"grp_b","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-15":{"id":15,"type":"RadioButton","parentId":14,"style":{"enabled":true,"varName":"bl","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-16":{"id":16,"type":"RadioButton","parentId":14,"style":{"enabled":true,"varName":"b","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-17":{"id":17,"type":"RadioButton","parentId":14,"style":{"enabled":true,"varName":"br","text":"","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}}},"order":[0,1,2,3,4,5,10,11,12,13,14,15,16,17],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // REFPOINT
  // ========
  // var refPoint = new Window("dialog"); 
  // refPoint.text = "Reference Point"; 
  // refPoint.orientation = "column"; 
  // refPoint.alignChildren = ["center","top"]; 
  // refPoint.spacing = 10; 
  // refPoint.margins = 16; 
  
  // PANEL1
  // ======
  var panel1 = container.add("panel", undefined, undefined, {name: "panel1"}); 
  panel1.text = "Reference"; 
  panel1.orientation = "column"; 
  panel1.alignChildren = ["right","center"]; 
  panel1.spacing = 10; 
  panel1.margins = 10; 
  
  // GRP_T
  // =====
  var grp_t = panel1.add("group", undefined, {name: "grp_t"}); 
  grp_t.orientation = "row"; 
  grp_t.alignChildren = ["center","center"]; 
  grp_t.spacing = 10; 
  grp_t.margins = 0; 
  
  var tl = grp_t.add("radiobutton", undefined, undefined, {name: "tl"}); 
  
  var t = grp_t.add("radiobutton", undefined, undefined, {name: "t"}); 
  
  var tr = grp_t.add("radiobutton", undefined, undefined, {name: "tr"}); 
  
  // GRP_M
  // =====
  var grp_m = panel1.add("group", undefined, {name: "grp_m"}); 
  grp_m.orientation = "row"; 
  grp_m.alignChildren = ["center","center"]; 
  grp_m.spacing = 10; 
  grp_m.margins = 0; 
  
  var l = grp_m.add("radiobutton", undefined, undefined, {name: "l"}); 
  
  var m = grp_m.add("radiobutton", undefined, undefined, {name: "m"}); 
  m.value = true; 
  
  var r = grp_m.add("radiobutton", undefined, undefined, {name: "r"}); 
  
  // GRP_B
  // =====
  var grp_b = panel1.add("group", undefined, {name: "grp_b"}); 
  grp_b.orientation = "row"; 
  grp_b.alignChildren = ["center","center"]; 
  grp_b.spacing = 10; 
  grp_b.margins = 0; 
  
  var bl = grp_b.add("radiobutton", undefined, undefined, {name: "bl"}); 
  
  var b = grp_b.add("radiobutton", undefined, undefined, {name: "b"}); 
  
  var br = grp_b.add("radiobutton", undefined, undefined, {name: "br"}); 
  
  return panel1
}

/**
 * Textbox input with a label and unit.
 * @param {object} docUnits 
 * @param {object} container 
 * ScriptUI container to add widget to.
 * @param {string} labelName 
 * Name of input label.
 * @param {number} arg 
 * Input argument.
 * @param {boolean} enabled 
 * Whether widget starts enabled or not.
 * @param {number} argWidth 
 * Width of the input textbox.
 * @returns {{widget: object, input: () string}}
 */
function widget_input(docUnits, container, labelName, arg, enabled, argWidth) {
  argWidth = argWidth !== undefined ? argWidth : 60
  enabled = enabled !== undefined ? enabled : true
  
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":35,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"container","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Container","preferredSize":[0,0],"margins":[20,30,20,30],"orientation":"row","spacing":30,"alignChildren":["center","center"]}},"item-35":{"id":35,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"grp_input","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":7,"alignChildren":["left","center"],"alignment":null}},"item-36":{"id":36,"type":"StaticText","parentId":35,"style":{"enabled":true,"varName":"label","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Label","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-37":{"id":37,"type":"EditText","parentId":35,"style":{"enabled":true,"varName":"input","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"left","preferredSize":[80,0],"alignment":null,"helpTip":null}},"item-38":{"id":38,"type":"StaticText","parentId":35,"style":{"enabled":true,"varName":"unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}}},"order":[0,35,36,37,38],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"}}
  */ 
  
  // GRP_INPUT
  // =========
  var grp_input = container.add("group", undefined, {name: "grp_input"}); 
  grp_input.orientation = "row"; 
  grp_input.alignChildren = ["left","center"]; 
  grp_input.spacing = 7; 
  grp_input.margins = 0; 
  grp_input.enabled = enabled
  
  var label = grp_input.add("statictext", undefined, undefined, {name: "label"}); 
  label.text = labelName + ":"; 
  
  var input = grp_input.add('edittext {properties: {name: "input"}}'); 
  input.text = prec(arg / docUnits.multiplier); 
  input.preferredSize.width = argWidth; 
  
  var unit = grp_input.add("statictext", undefined, undefined, {name: "statictext1"}); 
  unit.text = docUnits.unit_short; 
  
  return {
    widget: grp_input,
    input: function() {
      return input.text
    }
  }
}
