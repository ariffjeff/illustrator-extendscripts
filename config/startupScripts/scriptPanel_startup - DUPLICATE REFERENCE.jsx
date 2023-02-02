// Runs the script panel script on Illustrator startup

// File locations for this script:
// 1. C:\Program Files\Adobe\Adobe Illustrator [CURRENT VERSION]\Startup Scripts
// 2. A duplicate of this file is kept in the relevant git controlled scripts folder for the sake of git control.

// Reference:
// https://github.com/Silly-V/Adobe-Illustrator/blob/master/Script%20Panel%202/ScriptPanel_2.jsx

scriptsDir = app.path.fsName.replace(/\\/g, "/") + "/Presets/en_US/Scripts"
$.evalFile(scriptsDir + "/jsx_modules.jsx")

main()

function main() {
  if($.engineName != 'transient' && $.engineName != '') {
    xmlConfig = getXMLConfig()
    if(!(xmlConfig.xml.userOptions.scriptPanel.settings.runOnAppStartup * 1)) return 0
    
    scriptConfig = getScriptConfig()
    
    // var myMacPath = "/Users/You/FolderWhereItIs/ScriptPanel.jsx";
    var myPCPath = scriptsDir + "/scriptPanel.jsx"
    var startupLocation = (Folder.fs == "Windows") ? myPCPath : myMacPath
    
    var scriptPanelFilePath = File(startupLocation)
    if(scriptPanelFilePath.exists){
      var scriptString = getFileContents(scriptPanelFilePath)
      scriptString = mergeFileDependencies(scriptString, scriptPanelFilePath.parent)
      var bt = createBridgeTalkPackage(scriptString, scriptPanelFilePath)
      bt.send()
    } else {
      alert("The Script Panel file wasn't found at:\n'" + startupLocation + "'")
    }
    startupLocation = null
  }
}
