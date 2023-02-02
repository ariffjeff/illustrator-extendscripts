#include "jsx_modules.jsx"

main()

function main() {
  xmlConfig = getXMLConfig()
  var scriptPanelFilePath = function(){
    var thisFile;
    if(typeof startupLocation != "undefined" && startupLocation != null){
      thisFile = File(startupLocation);
    } else {
      thisFile = File($.fileName);
      if(!thisFile.exists){
        thisFile = File(btScript_MyLocation); // obtained from scriptPanel_startup.jsx
      }
    }
    if(!thisFile.exists){
      alert("The file path could not be found:\n" + $.fileName);
    }
    return thisFile;
  }();
  var jsxButtonsPath = app.path.fsName.replace(/\\/g, "/") + "/Presets/en_US/Scripts/config/scriptPanel_buttons/buttons"
  
  var buttonIconScriptFilePaths = getFilePathsFromDir(jsxButtonsPath, "*.jsx.png")
  var BUTTON_SETUP_SCRIPTS = {}
  for(var i = 0; i < buttonIconScriptFilePaths.length; i++) {
    BUTTON_SETUP_SCRIPTS[i] = {
      iconFilePath: buttonIconScriptFilePaths[i],
      scriptFilePath: File(scriptPanelFilePath.parent.toString() + "/" + buttonIconScriptFilePaths[i].name.replace(".png", ""))
    }
    BUTTON_SETUP_SCRIPTS[i].scriptFilePath.name = buttonIconScriptFilePaths[i].name.replace(".png", "")
  }
  
  var sp = new dialog_scriptPanel(undefined, BUTTON_SETUP_SCRIPTS, getFilePathsFromDir(jsxButtonsPath, "settings.png"))
  sp.show()
}

/**
* The script panel that displays scripts as buttons if their respective icon image exists
* @param {string} title Title of the panel
* @param {object} BUTTON_SETUP_SCRIPTS Object of script file paths and their respective button icon image file paths
* @param {string} BUTTON_SETTINGS_ICON_FILE_PATH File path of the settings button icon image
* @returns {Window} Window package
*/
function dialog_scriptPanel(title, BUTTON_SETUP_SCRIPTS, BUTTON_SETTINGS_ICON_FILE_PATH) {
  title = title ? title : "Scripts"
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":5,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"scriptPanel","windowType":"Palette","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":true,"independent":false,"closeButton":true,"borderless":false,"resizeable":true},"text":"Scripts","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":10,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"scriptBtns","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["center","center"],"alignment":null}},"item-4":{"id":4,"type":"IconButton","parentId":1,"style":{"enabled":true,"varName":"btn","text":"","preferredSize":[0,0],"creationProps":{"style":"toolbutton","toggle":false},"iconButtonStroke":false,"image":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAAsSAAALEgHS3X78AAACa0lEQVRIiWP8//8/AwiUlJU5MNAGXOjp6voAMpmxuLTUgOE/wzEGRgZOGlnG8P/vv+ze3p5pjMUlpS8YGBnEv3z6zPDz50+qWsLCzMzAJyDAwMjECOIqMoEs+vr5C9UtAoE/f/8yfPrwAcZVYAKRf//+QVEkJiLCwM/LRzULYYAJXZKdjY0hPz+fISY6kiqWIQMWdIHIiHAGKRlpMLY4e47hxOnTSA5hZzA1NgSzb9+5x/Dy9SswW1NNjUFYWAjMPnL8BE7LUHwGCjoBAUGGZ0+egrGGpgbYpzDw89dPBgtLK4bktDSG7JwssKi4qBhDWWUFWIwQQLHs4+dPDOvWroX7bMGixQw/f/1CMWLx4iVgWlZOjsHG0oIhMMAPzD957BheX2H4jBgACroVSyAWgnxjbmXF8OnjR4blK1eR5jNiwYHDR8EWwMDqlSsZPn76RBvL0IGOjg5R6siyLCwkiIGPn5/h8aNHYD4oKI309alvGSiZO7m6gtnz5s5l2LR+A5gdn5gAzhpUswxkWGR0FJi9b/duhgePHjPsO3AAzAf5FORjfAAjU+MDoHxWV9+AogKUMBITk4jST5UEQiwYtYwokJ2RzmBhaopTKUYCkZKSgrPnz59HkmWgwtvE3JzB+KQRw5Kly8FlLTKgSZypa2oySIiJYohj+OzajRsMM6dNh7j02TOSLAkKDmZ49vQJVl9htezT588oFSYpAFQ9PXr6FKcOcDAyM5OUt3ECbBaBWlhw9v9//+9y8/IogzjoDR9KASMjEwMPLy/MmAcsjEyMIf///9/FzcuDGaPUAP8ZfjAwMGT2dHU9AADvJc1z3ZiOXgAAAABJRU5ErkJggg=="],"alignment":null,"helpTip":null}},"item-5":{"id":5,"type":"IconButton","parentId":0,"style":{"enabled":true,"varName":"settings","text":"","preferredSize":[0,0],"creationProps":{"style":"toolbutton","toggle":false},"iconButtonStroke":false,"image":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAAsSAAALEgHS3X78AAABrElEQVRIie1Wy23CQBB9RLlDB4EKQFrtXuNUACWQDqCCQAfuIKQDqCDk6pUV6AAqCFRA5OhtNCwMxvlwiDK3sd/Mm5l9O3Ztt9vhUnZ1MaY/TXZdBZz5PAGQBN9ZM/o1MhI9CL8SmarGzOcdACmAibNmkvm8D2AAoC1g4+I9gIbEViIj0RxAnY/WAG5OFL0V2HuNUBNITwRDEBVJXwDMACzFe4ntaxVpZ5aSMIysIBk5a1IJomDSCDfQyI525qzZANiIR0lMRNycogld1qO4crLM500At3THzpqFloCFydGpne0JhMJ4jTAtZ81KSyBiF5FSh/E04s4aRyovJaJNy3L95Lo6SF5GtqK0P2XN0Z5jYY2F63FwztqlLqp8oztz1vROkfEKPNM9OCutsw+jwp7odrmqNKJOdF7qutKk3+GlDvaY+XzKKxEwjczng2itIYrbM22DJFGCwrrscsuzbSuxPa07bYypGOOWuzBYPSJaC0EtT+1GVfrOmiJoyFVVVNuiyqTdOWuanMSYWHVdVfq7ynw+kh9PZ03t7OAvfKml6tQONPv/b/y+AXgHNYGYmYPyuG0AAAAASUVORK5CYII="],"alignment":"right","helpTip":"Settings..."}}},"order":[0,1,4,5],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"none"}}
  */
  
  // SCRIPTPANEL
  // ===========
  var scriptPanel = new Window("palette", undefined, undefined, {minimizeButton: true, resizeable: true}); 
  scriptPanel.text = title;
  scriptPanel.orientation = "column";
  scriptPanel.alignChildren = ["center", "top"];
  scriptPanel.spacing = 10;
  scriptPanel.margins = 16;
  scriptPanel.location = [1400, 500]
  
  // SCRIPTBTNS
  // ==========
  var grp_scriptBtns = scriptPanel.add("group", undefined, { name: "scriptBtns" });
  grp_scriptBtns.orientation = "column";
  grp_scriptBtns.alignChildren = ["center", "center"];
  grp_scriptBtns.spacing = 10;
  grp_scriptBtns.margins = 0;
  
  var buttons = createScriptButtons(grp_scriptBtns, BUTTON_SETUP_SCRIPTS)
  
  var settingsDialog = scriptPanel.add("iconbutton", undefined, File.decode(BUTTON_SETTINGS_ICON_FILE_PATH), {name: "settings", style: "toolbutton"}); 
  settingsDialog.helpTip = "Settings..."; 
  settingsDialog.alignment = ["right","top"]; 
  
  settingsDialog.onClick = function() {
    xmlConfig = getXMLConfig()
    var choice = dialog_settings(xmlConfig.xml.userOptions.scriptPanel.settings)
    if(choice === false) return
    writeXML(xmlConfig)
  }
  
  scriptPanel.onShow = function(){}; // prevents this pallete from stopping user actions in other windows
  return scriptPanel
}

/**
* Settings dialog for the script panel
* @param {XML} xmlSettings XML options
* @returns {boolean} Overwrites intaken XML if dialog is accepted
*/
function dialog_settings(xmlSettings) {
  /*
  Code for Import https://scriptui.joonas.me — (Triple click to select): 
  {"activeId":1,"items":{"item-0":{"id":0,"type":"Dialog","parentId":false,"style":{"enabled":true,"varName":"settings","windowType":"Dialog","creationProps":{"su1PanelCoordinates":false,"maximizeButton":false,"minimizeButton":true,"independent":false,"closeButton":true,"borderless":false,"resizeable":true},"text":"Settings","preferredSize":[0,0],"margins":16,"orientation":"column","spacing":15,"alignChildren":["center","top"]}},"item-1":{"id":1,"type":"Checkbox","parentId":0,"style":{"enabled":true,"varName":"runOnAppStartup","text":"Run script panel on startup","preferredSize":[0,0],"alignment":null,"helpTip":null,"checked":false}},"item-2":{"id":2,"type":"Group","parentId":0,"style":{"enabled":true,"varName":"usrBtns","preferredSize":[0,0],"margins":0,"orientation":"row","spacing":10,"alignChildren":["left","center"],"alignment":null}},"item-3":{"id":3,"type":"Button","parentId":2,"style":{"enabled":true,"varName":"ok","text":"OK","justify":"center","preferredSize":[70,30],"alignment":null,"helpTip":null}},"item-4":{"id":4,"type":"Button","parentId":2,"style":{"enabled":true,"varName":"cancel","text":"Cancel","justify":"center","preferredSize":[70,30],"alignment":null,"helpTip":null}}},"order":[0,1,2,3,4],"settings":{"importJSON":true,"indentSize":false,"cepExport":false,"includeCSSJS":true,"showDialog":true,"functionWrapper":false,"afterEffectsDockable":false,"itemReferenceList":"none"}}
  */ 
  
  // SETTINGS
  // ========
  var settings = new Window("dialog", undefined, undefined, {minimizeButton: true, resizeable: true}); 
  settings.text = "Settings"; 
  settings.orientation = "column"; 
  settings.alignChildren = ["center","top"]; 
  settings.spacing = 15; 
  settings.margins = 16; 
  
  var runOnAppStartup = settings.add("checkbox", undefined, undefined, {name: "runOnStartup"}); 
  runOnAppStartup.text = "Run script panel on startup"; 
  runOnAppStartup.value = Number(xmlSettings.runOnAppStartup) ? true : false
  
  // USRBTNS
  // =======
  var usrBtns = settings.add("group", undefined, {name: "usrBtns"}); 
  usrBtns.orientation = "row"; 
  usrBtns.alignChildren = ["left","center"]; 
  usrBtns.spacing = 10; 
  usrBtns.margins = 0; 
  
  var ok = usrBtns.add("button", undefined, undefined, {name: "ok"}); 
  ok.text = "OK"; 
  ok.preferredSize.width = 70; 
  ok.preferredSize.height = 30; 
  
  var cancel = usrBtns.add("button", undefined, undefined, {name: "cancel"}); 
  cancel.text = "Cancel"; 
  cancel.preferredSize.width = 70; 
  cancel.preferredSize.height = 30; 
  
  var choice = settings.show();
  if(choice == 2) return false
  
  xmlSettings.runOnAppStartup = runOnAppStartup.value ? 1 : 0
}

function createScriptButtons(parent, BUTTON_SETUP_SCRIPTS) {
  var btns = {}
  var scriptString
  var grp_buttonRow
  for(var i in BUTTON_SETUP_SCRIPTS) {
    if(i % xmlConfig.xml.defaults.scriptPanel.buttonsPerRow == 0) grp_buttonRow = parent.add("group", undefined, { name: "btnRow" }); // new row of buttons
    btns[i] = {
      "button" : grp_buttonRow.add("iconbutton", undefined, BUTTON_SETUP_SCRIPTS[i].iconFilePath, {name: "iconbutton1", style: "toolbutton"})
    }
    btns[i].button.scriptFilePath = BUTTON_SETUP_SCRIPTS[i].scriptFilePath
    btns[i].button.helpTip = BUTTON_SETUP_SCRIPTS[i].scriptFilePath.name
    
    scriptString = getFileContents(btns[i].button.scriptFilePath)
    scriptString = mergeFileDependencies(scriptString, btns[i].button.scriptFilePath.parent)
    
    btns[i].button.script = scriptString
    btns[i].button.btPackage = createBridgeTalkPackage(btns[i].button.script, btns[i].button.scriptFilePath)
    
    btns[i].button.onClick = function() {
      this.btPackage.send()
    }
  }
  return btns
}
