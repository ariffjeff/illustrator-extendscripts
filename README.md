# Illustrator Extendscripts
A useful set of scripts for Adobe Illustrator that solve many unique problems for graphic designers.  

The scripts are made to help designers speed up their workflows by mapping the most used scripts to hotkeys. Open each `.jsx` file and read the top blurb to understand the script's functionality.  

Many of the scripts were made with a graphic designer's print shop workflow in mind but most can easily be used in other workflows.

The most useful script is probably `proof.jsx` which allows a designer to easily create many new organized iterations of projects for many clients in only a few clicks. `proof.jsx` requires an Illustrator template `.ait` file to function which is accessed to automatically conform a designer's desired work into a client proof as a final export.  

#### Modularity
Provided are both `jsx_modules.jsx` and `dialogWidgets.jsx` which do nothing when executed directly (no `main()` function) but provide many useful functions to the other scripts.  
Use and add to these meta scripts if you write your own scripts. Especially add to `dialogWidgets.jsx` since it is missing much functionality.

# Installation
1. Open the scripts directory for your current version of Illustrator:  
`C:/Program Files/Adobe/Adobe Illustrator VERSION/Presets/en_US/Scripts`
  
2. Set the user permissions of this directory in its properties security tab to allow full control in order to prevent permission errors when moving files in and out of the folder.
  
3. Clone this repository into the `/Scripts` directory. Do not clone into a sub folder of `/Scripts` since Illustrator does not search for scripts in sub folders.  
  Since `/Scripts` probably has files already existing in it, Git might not let you clone into the folder. In this case...  
    1. Rename the `/Scripts` folder to a temporary name.  
    2. Clone the repo to a new `/Scripts` folder.  
    3. Then move the contents of the older folder to the new one.
  
4. Once downloaded and set up, manually duplicate "`scriptPanel_startup - DUPLICATE REFERENCE.jsx`" from `/config/startupScripts` to the Illustrator startup scripts folder: (create the folder if it doesn't exist) `C:/Program Files/Adobe/Adobe Illustrator VERSION/Startup Scripts`
  
5. Finally, remove "` - DUPLICATE REFERENCE`" from the file name.
  
6. Restart Illustrator to update the script list in File > Scripts  
  

# Optimize Usage
For more ergonomic ways to access scripts:  
1. Assign hotkeys in Illustrator
    1. Window > Actions
    2. Create a new action (and stop the action recording immediately after)
    3. Window > Actions > Insert Menu Item...
    4. Enter in the script name, click "Find:", and click OK.
2. Use `scriptPanel.jsx`
    - `scriptPanel.jsx` allows you to click on scripts in a list UI, but it is slow to execute scripts.
    - Use the `JSX Launcher` extension by Ten Agata. It is faster than `scriptPanel.jsx` but has its own disadvantages.
      https://exchange.adobe.com/creativecloud.details.12096.jsx-launcher.html  
      Window > Extensions


# Adobe ExtendScript
  ExtendScript is based off of ECMAScript 3. This means you cannot use the latest ES6 functionality in Illustrator scripts.  
  
  If you want to implement ES6-like functionality, see section "`Adding Methods to Prototype and its Issues`" below.  
  https://community.adobe.com/t5/illustrator/what-version-of-javascript-supported/td-p/10488199


# Documentation & References
Note: Even though the following appear to be out of date, they are not.  
  - ADOBE ILLUSTRATOR CC 2017SCRIPTING REFERENCE: JAVASCRIPT - ADOBE® ILLUSTRATOR® CC 2017  
  https://www.adobe.com/content/dam/acom/en/devnet/illustrator/pdf/Illustrator_JavaScript_Scripting_Reference_2017.pdf

  - JAVASCRIPT TOOLS GUIDE - ADOBE® CREATIVE SUITE® 5  
  https://www.adobe.com/content/dam/acom/en/devnet/scripting/estk/javascript_tools_guide.pdf

  - Adobe Illustrator CS6 Type Library  
  http://jongware.mit.edu/iljscs6html/iljscs6/

  - Adobe community  
  https://community.adobe.com/

  - ScriptUI Builder  
      https://scriptui.joonas.me/  
    Documentation  
      https://adobeindd.com/view/publications/a0207571-ff5b-4bbf-a540-07079bd21d75/92ra/publication-web-resources/pdf/scriptui-2-16-j.pdf 


# Custom jsx panels
https://community.adobe.com/t5/illustrator/can-i-make-a-button-to-run-a-script/td-p/10043240?page=1


# Controlling Additional User Options/Preferences
#### You can execute certain Illustrator menu commands that aren't usually available through typical JavaScript syntax.  
See `_commands.txt`  

#### You can also directly target and change specific user options/preferences:  
For example, to change the "`Scale Corners`" toggle for the scale transformation of objects, you can use:  
`preferences.getIntegerPreference("policyForPreservingCorners")`  
`preferences.setIntegerPreference("policyForPreservingCorners", 1)`  

#### Path to list of preferences:  
`C:/Users/{USER}/AppData/Roaming/Adobe/Adobe Illustrator {CURRENT ILLUSTRATOR VERSION} Settings/en_US/x64`...  
  `/Adobe Illustrator Prefs`  
  `/Adobe Illustrator Cloud Prefs`  


# Initializing scripts
  You do not need to use the custom initialization functions at the start of any new scripts to make them work. They only exist to help you get a head start.


# ScriptUI, Creating User Dialogs
Don't waste your time creating dialogs manually.  
Instead use: https://scriptui.joonas.me/ (only works in Chrome).  


# Setting Default Hotkeys for Buttons (ENTER and ESCAPE)
#### In the Chrome scriptUI creator:  

OK:  
  - Set a button's `Custom Name` to "`ok`".  
  - Set `Text` to whatever is appropriate.  

Cancel:  
  - Set a button's `Custom Name` to "`cancel`"  
  - Set `Text` to whatever is appropriate.  
  

# Illustrator Window Flickering
Flickering occurs when dialog inputs are set to active by default when a user closes a dialog window. This happens because an active input by default transfers window focus back to Illustrator on dialog close which conflicts with the following line:  
`BridgeTalk.bringToFront("illustrator") // comment out if any dialog inputs are active by default to prevent double Illustrator focus and therefore window flickering`


# Position Coordinate System
When working with position coordinates, know that internally/in ExtendScript the coordinate system is `[x, y]`, but the Illustrator GUI treats it as `[x, -y]`.


# Adding Methods to Prototype and its Issues
Do not add to any protoype as you will get errors when you try to iterate over objects with for-in loops. It's generally bad practice anyways unless you really know what you are doing.  

i.e.: `Object.prototype.myNewMethod = function()` {...}  
If you need to add new methods then do: `Object.myNewMethod = function()` {...}  

https://stackoverflow.com/questions/10757455/object-prototype-is-verboten  


# XML
You can store, access, and edit XML.  
`/config/scriptConfig.xml` is already loaded with data that you will need to change for your system depending on what scripts you use. Or just make your own XML file as needed while using the provided file as reference.  


# Selection Object Desync
Use `redraw()` or set an object's position to itself to fix weird debugger desync issues.  

i.e.: `selection[0].position = selection[0].position`  

`redraw()` unfortunately adds to the undo stack which can be annoying for the user when they undo the result of a script. So use the weird position setting solution instead which does not seem to have any drawbacks.  


# Debugging - VSCode Adobe ExtendScript Debugger
The official ExtendScript debugger is terrible and crashes half the time when you use it, seriously. There is no way around this because there are no other ExtendScript debuggers for VSCode (that are known). If the debug process crashes then just try to run it again. If it doesn't start then restart VSCode. Sometimes you have to restart it twice because you'll continue to get errors! Yes, it's that bad.

#### Both the Debug Process and Illustrator Lockup Together:
1. Close VSCode and wait for Illustrator to respond again.
2. Reopen VSCode and comment out `BridgeTalk.bringToFront("illustrator")` before debugging as that line seems to cause this problem.
3. Don't forget to uncomment it again when you're done debugging.  
This issue seems to exclusively occur when sometimes displaying ScriptUI dialogs.

#### Inconsistent Results Between Native Execution and Debugging
Sometimes a script will produce different results depending on whether you ran it through the debug process or directly from Illustrator.  
Be sure to test both when writing code or just use your best judgement.  

# Updating `launch.json` after a major version update to Illustrator
`C:/Program Files/Adobe/Adobe Illustrator VERSION/Presets/en_US/Scripts/.vscode`  
Or, while in VSCode click on the gear icon next to the debug button when the relevant debugger is selected.  

When you install a new **major** version of Illustrator and want to use the ExtendScript debugger for that version then you will need to update `launch.json` by simply incrementing the `targetSpecifier` value to the version of Illustrator you are now using. You shouldn't need to change the numbers after the decimal.  

For exmaple:  
`"targetSpecifier": "illustrator-25.064"`  
would change to...  
`"targetSpecifier": "illustrator-26.064"`  
