#include "jsx_modules.jsx"
#include "dialogWidgets.jsx"

// Position selected items into a grid array.

// Author: Ariff Jeff
// Contact: ariff.jeff@uconn.edu

BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default
main()

function main() {
  if(documents.length < 1) {
    alert("Open a document and try again.");
    return
  }
  var docSource = activeDocument
  
  if(selection == 0) {
    return
  }
  var artObjects = selection
  
  var docUnits = getDocUnit()
  if(docUnits === false) return
  
  var layout = dialog_chooseLayout(docUnits)
  if(layout === false) return
  
  switch (layout.type) {
    case "Grid":
    
    break;
    
    case "Grid - Strict":
    
    break;
    
    case "Grid - Packed":
    
    break;
    
    case "Row":
    // var totalWidth = artObjects[0].width
    for(var i = 1; i < artObjects.length; i++) {
      // totalWidth += artObjects[i].width
      artObjects[i].position = [artObjects[i-1].position[0] + artObjects[i-1].width + layout.spacing, artObjects[i-1].position[1]]
    }
    break;
    
    case "Column":
    var totalHeight = artObjects[0].height
    for(var i = 1; i < artObjects.length; i++) {
      totalHeight += artObjects[i].height
      artObjects[i].position = [artObjects[i-1].position[0], artObjects[i-1].position[1] - artObjects[i-1].height]
    }
    break;
    
    case "Stacked":
    for(var i = 1; i < artObjects.length; i++) {
      artObjects[i].position = refPoint
    }
    break;
    
    default:
    break;
  }
  
  
  
  // // center everything
  // for(var i = 0; i < artObjects.length; i++) {
  //   artObjects[i].position = [artObjects[i].position[0] - totalWidth / 2, artObjects[i].position[1]]
  // }
}

function dialog_chooseLayout(docUnits) {
  
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"arrange","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":false,"independent":false,"closeButton":false,"borderless":false,"resizeable":false},"text":"Arrange","preferredSize":[0,0],"margins":16,"orientation":"row","spacing":20,"alignChildren":["left","top"]}},"item-1":{"id":1,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"type_grid_packed","text":"Grid - Packed","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-2":{"id":2,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"type_grid","text":"Grid","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-4":{"id":4,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"userBtns","preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-5":{"id":5,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[70,30],"alignment":null,"helpTip":null}},"item-6":{"id":6,"type":"Button","parentId":4,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[70,30],"alignment":null,"helpTip":null}},"item-7":{"id":7,"type":"Panel","parentId":0,"style":{"enabled":true,"varName":"types","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Type","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null},"hidden":true},"item-27":{"id":27,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"type_row","text":"Row","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-28":{"id":28,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"type_column","text":"Column","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-29":{"id":29,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"type_stacked","text":"Stacked","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-31":{"id":31,"type":"RadioButton","parentId":7,"style":{"enabled":true,"varName":"type_grid_strict","text":"Grid - Strict","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-32":{"id":32,"type":"TabbedPanel","parentId":0,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":10,"alignment":null,"selection":39}},"item-33":{"id":33,"type":"Tab","parentId":32,"style":{"enabled":true,"varName":"tab_grid","text":"Grid","orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-34":{"id":34,"type":"Tab","parentId":32,"style":{"enabled":true,"varName":"tab_grid_strict","text":"Grid - Strict","orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-38":{"id":38,"type":"Tab","parentId":32,"style":{"enabled":true,"varName":"tab_grid_packed","text":"Grid - Packed","orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-39":{"id":39,"type":"Tab","parentId":32,"style":{"enabled":true,"varName":"tab_row","text":"Row","orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-40":{"id":40,"type":"Tab","parentId":32,"style":{"enabled":true,"varName":"tab_column","text":"Column","orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-41":{"id":41,"type":"Tab","parentId":32,"style":{"enabled":true,"varName":"tab_stacked","text":"Stacked","orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-42":{"id":42,"type":"EditText","parentId":43,"style":{"enabled":true,"varName":"rowSpacing","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"right","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-43":{"id":43,"type":"Group","parentId":77,"style":{"enabled":true,"varName":"grp_spacing","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-44":{"id":44,"type":"StaticText","parentId":43,"style":{"enabled":true,"varName":"spacing_unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-45":{"id":45,"type":"StaticText","parentId":43,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Spacing","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-48":{"id":48,"type":"Divider","parentId":33,"style":{"enabled":true,"varName":null}},"item-49":{"id":49,"type":"Divider","parentId":34,"style":{"enabled":true,"varName":null}},"item-50":{"id":50,"type":"Divider","parentId":38,"style":{"enabled":true,"varName":null}},"item-51":{"id":51,"type":"Divider","parentId":40,"style":{"enabled":true,"varName":null}},"item-52":{"id":52,"type":"Divider","parentId":41,"style":{"enabled":true,"varName":null}},"item-53":{"id":53,"type":"Group","parentId":40,"style":{"enabled":true,"varName":"grp_spacing","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-54":{"id":54,"type":"StaticText","parentId":53,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Spacing","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-55":{"id":55,"type":"EditText","parentId":53,"style":{"enabled":true,"varName":"columnSpacing","creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"0","justify":"right","preferredSize":[50,0],"alignment":null,"helpTip":null}},"item-56":{"id":56,"type":"StaticText","parentId":53,"style":{"enabled":true,"varName":"spacing_unit","creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"unit","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-57":{"id":57,"type":"Group","parentId":33,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-58":{"id":58,"type":"StaticText","parentId":57,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Ratio","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-59":{"id":59,"type":"EditText","parentId":57,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"1","justify":"center","preferredSize":[35,0],"alignment":null,"helpTip":null}},"item-60":{"id":60,"type":"StaticText","parentId":57,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":":","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-61":{"id":61,"type":"EditText","parentId":57,"style":{"enabled":true,"varName":null,"creationProps":{"noecho":false,"readonly":false,"multiline":false,"scrollable":false,"borderless":false,"enterKeySignalsOnChange":false},"softWrap":false,"text":"1","justify":"center","preferredSize":[35,0],"alignment":null,"helpTip":null}},"item-62":{"id":62,"type":"Group","parentId":33,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-63":{"id":63,"type":"StaticText","parentId":62,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Row","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-64":{"id":64,"type":"Slider","parentId":62,"style":{"enabled":true,"varName":null,"preferredSize":[200,0],"alignment":null,"helpTip":null}},"item-65":{"id":65,"type":"StaticText","parentId":62,"style":{"enabled":true,"varName":null,"creationProps":{"truncate":"none","multiline":false,"scrolling":false},"softWrap":false,"text":"Column","justify":"left","preferredSize":[0,0],"alignment":null,"helpTip":null}},"item-67":{"id":67,"type":"RadioButton","parentId":70,"style":{"enabled":true,"varName":"viewportCenter","text":"Viewport center","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-68":{"id":68,"type":"RadioButton","parentId":70,"style":{"enabled":true,"varName":"topObject","text":"Top object","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":true}},"item-70":{"id":70,"type":"Panel","parentId":41,"style":{"enabled":true,"varName":"stackPosition","creationProps":{"borderStyle":"etched","su1PanelCoordinates":false},"text":"Stack Position","preferredSize":[0,0],"margins":10,"orientation":"column","spacing":10,"alignChildren":["left","top"],"alignment":null}},"item-75":{"id":75,"type":"Divider","parentId":39,"style":{"enabled":true,"varName":null}},"item-76":{"id":76,"type":"Group","parentId":39,"style":{"enabled":true,"varName":"grp_elements","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":30,"alignChildren":["center","top"],"alignment":"fill"}},"item-77":{"id":77,"type":"Group","parentId":76,"style":{"enabled":true,"varName":null,"preferredSize":[0,0],"margins":0,"orientation":"column","spacing":10,"alignChildren":["left","center"],"alignment":null}}},"order":[0,32,33,48,62,63,64,65,57,58,59,60,61,34,49,38,50,39,75,76,77,43,45,42,44,40,51,53,54,55,56,41,52,70,68,67,7,2,31,1,27,28,29,4,5,6],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"None"},"activeId":5}
  */ 
  
  // ARRANGE
  // =======
  var arrange = new Window("dialog", undefined, undefined, {closeButton: false}); 
  arrange.text = "Arrange"; 
  arrange.orientation = "row"; 
  arrange.alignChildren = ["left","top"]; 
  arrange.spacing = 20; 
  arrange.margins = 16; 
  
  // TPANEL1
  // =======
  var tpanel1 = arrange.add("tabbedpanel", undefined, undefined, {name: "tpanel1"}); 
  tpanel1.alignChildren = "fill"; 
  tpanel1.preferredSize.width = 497.75; 
  tpanel1.margins = 0; 
  
  // TAB_GRID
  // ========
  var tab_grid = tpanel1.add("tab", undefined, undefined, {name: "tab_grid"}); 
  tab_grid.text = "Grid"; 
  tab_grid.orientation = "column"; 
  tab_grid.alignChildren = ["center","top"]; 
  tab_grid.spacing = 10; 
  tab_grid.margins = 10; 
  
  var divider1 = tab_grid.add("panel", undefined, undefined, {name: "divider1"}); 
  divider1.alignment = "fill"; 
  
  // GROUP1
  // ======
  var group1 = tab_grid.add("group", undefined, {name: "group1"}); 
  group1.orientation = "row"; 
  group1.alignChildren = ["left","center"]; 
  group1.spacing = 10; 
  group1.margins = 0; 
  
  var statictext1 = group1.add("statictext", undefined, undefined, {name: "statictext1"}); 
  statictext1.text = "Row"; 
  
  var slider1 = group1.add("slider", undefined, undefined, undefined, undefined, {name: "slider1"}); 
  slider1.minvalue = 0; 
  slider1.maxvalue = 100; 
  slider1.value = 50; 
  slider1.preferredSize.width = 200; 
  
  var statictext2 = group1.add("statictext", undefined, undefined, {name: "statictext2"}); 
  statictext2.text = "Column"; 
  
  // GROUP2
  // ======
  var group2 = tab_grid.add("group", undefined, {name: "group2"}); 
  group2.orientation = "row"; 
  group2.alignChildren = ["left","center"]; 
  group2.spacing = 10; 
  group2.margins = 0; 
  
  var statictext3 = group2.add("statictext", undefined, undefined, {name: "statictext3"}); 
  statictext3.text = "Ratio"; 
  
  var edittext1 = group2.add('edittext {justify: "center", properties: {name: "edittext1"}}'); 
  edittext1.text = "1"; 
  edittext1.preferredSize.width = 35; 
  
  var statictext4 = group2.add("statictext", undefined, undefined, {name: "statictext4"}); 
  statictext4.text = ":"; 
  
  var edittext2 = group2.add('edittext {justify: "center", properties: {name: "edittext2"}}'); 
  edittext2.text = "1"; 
  edittext2.preferredSize.width = 35; 
  
  // TAB_GRID_STRICT
  // ===============
  var tab_grid_strict = tpanel1.add("tab", undefined, undefined, {name: "tab_grid_strict"}); 
  tab_grid_strict.text = "Grid - Strict"; 
  tab_grid_strict.orientation = "column"; 
  tab_grid_strict.alignChildren = ["center","top"]; 
  tab_grid_strict.spacing = 10; 
  tab_grid_strict.margins = 10; 
  
  var divider2 = tab_grid_strict.add("panel", undefined, undefined, {name: "divider2"}); 
  divider2.alignment = "fill"; 
  
  // TAB_GRID_PACKED
  // ===============
  var tab_grid_packed = tpanel1.add("tab", undefined, undefined, {name: "tab_grid_packed"}); 
  tab_grid_packed.text = "Grid - Packed"; 
  tab_grid_packed.orientation = "column"; 
  tab_grid_packed.alignChildren = ["center","top"]; 
  tab_grid_packed.spacing = 10; 
  tab_grid_packed.margins = 10; 
  
  var divider3 = tab_grid_packed.add("panel", undefined, undefined, {name: "divider3"}); 
  divider3.alignment = "fill"; 
  
  // TAB_ROW
  // =======
  var tab_row = tpanel1.add("tab", undefined, undefined, {name: "tab_row"}); 
  tab_row.text = "Row"; 
  tab_row.orientation = "column"; 
  tab_row.alignChildren = ["center","top"]; 
  tab_row.spacing = 10; 
  tab_row.margins = 10; 
  
  var divider4 = tab_row.add("panel", undefined, undefined, {name: "divider4"}); 
  divider4.alignment = "fill"; 
  
  // GRP_ELEMENTS
  // ============
  var grp_elements = tab_row.add("group", undefined, {name: "grp_elements"}); 
  grp_elements.orientation = "row"; 
  grp_elements.alignChildren = ["center","top"]; 
  grp_elements.spacing = 30; 
  grp_elements.margins = 0; 
  grp_elements.alignment = ["fill","top"]; 
  
  // GROUP3
  // ======
  var group3 = grp_elements.add("group", undefined, {name: "group3"}); 
  group3.orientation = "column"; 
  group3.alignChildren = ["left","center"]; 
  group3.spacing = 10; 
  group3.margins = 0; 
  
  var refPoint = widget_referencePoint(grp_elements)
  
  // GRP_SPACING
  // ===========
  var grp_spacing = group3.add("group", undefined, {name: "grp_spacing"}); 
  grp_spacing.orientation = "row"; 
  grp_spacing.alignChildren = ["left","center"]; 
  grp_spacing.spacing = 10; 
  grp_spacing.margins = 0; 
  
  var statictext5 = grp_spacing.add("statictext", undefined, undefined, {name: "statictext5"}); 
  statictext5.text = "Spacing"; 
  
  var rowSpacing = grp_spacing.add('edittext {justify: "right", properties: {name: "rowSpacing"}}'); 
  rowSpacing.text = "0"; 
  rowSpacing.preferredSize.width = 50; 
  
  var spacing_unit = grp_spacing.add("statictext", undefined, undefined, {name: "spacing_unit"}); 
  spacing_unit.text = "unit"; 
  
  // TAB_COLUMN
  // ==========
  var tab_column = tpanel1.add("tab", undefined, undefined, {name: "tab_column"}); 
  tab_column.text = "Column"; 
  tab_column.orientation = "column"; 
  tab_column.alignChildren = ["center","top"]; 
  tab_column.spacing = 10; 
  tab_column.margins = 10; 
  
  var divider5 = tab_column.add("panel", undefined, undefined, {name: "divider5"}); 
  divider5.alignment = "fill"; 
  
  // GRP_SPACING1
  // ============
  var grp_spacing1 = tab_column.add("group", undefined, {name: "grp_spacing1"}); 
  grp_spacing1.orientation = "row"; 
  grp_spacing1.alignChildren = ["left","center"]; 
  grp_spacing1.spacing = 10; 
  grp_spacing1.margins = 0; 
  
  var statictext6 = grp_spacing1.add("statictext", undefined, undefined, {name: "statictext6"}); 
  statictext6.text = "Spacing"; 
  
  var columnSpacing = grp_spacing1.add('edittext {justify: "right", properties: {name: "columnSpacing"}}'); 
  columnSpacing.text = "0"; 
  columnSpacing.preferredSize.width = 50; 
  
  var spacing_unit1 = grp_spacing1.add("statictext", undefined, undefined, {name: "spacing_unit1"}); 
  spacing_unit1.text = "unit"; 
  
  // TAB_STACKED
  // ===========
  var tab_stacked = tpanel1.add("tab", undefined, undefined, {name: "tab_stacked"}); 
  tab_stacked.text = "Stacked"; 
  tab_stacked.orientation = "column"; 
  tab_stacked.alignChildren = ["center","top"]; 
  tab_stacked.spacing = 10; 
  tab_stacked.margins = 10; 
  
  // TPANEL1
  // =======
  tpanel1.selection = tab_row; 
  
  var divider6 = tab_stacked.add("panel", undefined, undefined, {name: "divider6"}); 
  divider6.alignment = "fill"; 
  
  // STACKPOSITION
  // =============
  var stackPosition = tab_stacked.add("panel", undefined, undefined, {name: "stackPosition"}); 
  stackPosition.text = "Stack Position"; 
  stackPosition.orientation = "column"; 
  stackPosition.alignChildren = ["left","top"]; 
  stackPosition.spacing = 10; 
  stackPosition.margins = 10; 
  
  var topObject = stackPosition.add("radiobutton", undefined, undefined, {name: "topObject"}); 
  topObject.text = "Top object"; 
  topObject.value = true; 
  
  var viewportCenter = stackPosition.add("radiobutton", undefined, undefined, {name: "viewportCenter"}); 
  viewportCenter.text = "Viewport center"; 
  
  // TYPES
  // =====
  // var types = arrange.add("panel", undefined, undefined, {name: "types"}); 
  // types.text = "Type"; 
  // types.orientation = "column"; 
  // types.alignChildren = ["left","top"]; 
  // types.spacing = 10; 
  // types.margins = 10; 
  
  // var type_grid = types.add("radiobutton", undefined, undefined, {name: "type_grid"}); 
  // type_grid.text = "Grid"; 
  // type_grid.value = true; 
  
  // var type_grid_strict = types.add("radiobutton", undefined, undefined, {name: "type_grid_strict"}); 
  // type_grid_strict.text = "Grid - Strict"; 
  
  // var type_grid_packed = types.add("radiobutton", undefined, undefined, {name: "type_grid_packed"}); 
  // type_grid_packed.text = "Grid - Packed"; 
  
  // var type_row = types.add("radiobutton", undefined, undefined, {name: "type_row"}); 
  // type_row.text = "Row"; 
  
  // var type_column = types.add("radiobutton", undefined, undefined, {name: "type_column"}); 
  // type_column.text = "Column"; 
  
  // var type_stacked = types.add("radiobutton", undefined, undefined, {name: "type_stacked"}); 
  // type_stacked.text = "Stacked"; 
  
  // USERBTNS
  // ========
  var userBtns = arrange.add("group", undefined, {name: "userBtns"}); 
  userBtns.orientation = "column"; 
  userBtns.alignChildren = ["left","center"]; 
  userBtns.spacing = 10; 
  userBtns.margins = 0; 
  
  var ok = userBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 70; 
  ok.preferredSize.height = 30; 
  
  var cancel = userBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 70; 
  cancel.preferredSize.height = 30; 
  
  var choice = arrange.show();
  if(choice == 2) return false
  
  return {
    type: tpanel1.selection.text,
    spacing: .25 * docUnits.multiplier
  }
}
