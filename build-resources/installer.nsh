; Custom NSIS script for Windows installer

; Add custom installation steps
!macro customInstall
  ; Create shortcuts with proper working directory
  CreateShortCut "$DESKTOP\CNC Jog Controls.lnk" "$INSTDIR\CNC Jog Controls.exe" "" "$INSTDIR\CNC Jog Controls.exe" 0 SW_SHOWNORMAL ALT|CONTROL|SHIFT|F5 "Professional CNC machine control application"
  
  ; Register G-code file association
  WriteRegStr HKCR ".gcode" "" "GCodeFile"
  WriteRegStr HKCR ".nc" "" "GCodeFile"
  WriteRegStr HKCR ".cnc" "" "GCodeFile"
  WriteRegStr HKCR "GCodeFile" "" "G-code File"
  WriteRegStr HKCR "GCodeFile\DefaultIcon" "" "$INSTDIR\CNC Jog Controls.exe,0"
  WriteRegStr HKCR "GCodeFile\shell\open\command" "" '"$INSTDIR\CNC Jog Controls.exe" "%1"'
  
  ; Add to Windows Firewall exceptions
  SimpleFC::AddApplication "CNC Jog Controls" "$INSTDIR\CNC Jog Controls.exe" 0 2 "" 1
  Pop $0
  
  ; Create uninstaller registry entries
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CNC Jog Controls" "DisplayName" "CNC Jog Controls"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CNC Jog Controls" "UninstallString" "$INSTDIR\Uninstall CNC Jog Controls.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CNC Jog Controls" "Publisher" "Jogger CNC Tools"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CNC Jog Controls" "HelpLink" "https://github.com/jogger-cnc/jog-controls"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CNC Jog Controls" "URLInfoAbout" "https://github.com/jogger-cnc/jog-controls"
!macroend

; Add custom uninstallation steps
!macro customUnInstall
  ; Remove shortcuts
  Delete "$DESKTOP\CNC Jog Controls.lnk"
  
  ; Remove file associations
  DeleteRegKey HKCR ".gcode"
  DeleteRegKey HKCR ".nc"
  DeleteRegKey HKCR ".cnc"
  DeleteRegKey HKCR "GCodeFile"
  
  ; Remove from Windows Firewall exceptions
  SimpleFC::RemoveApplication "$INSTDIR\CNC Jog Controls.exe"
  Pop $0
  
  ; Remove uninstaller registry entries
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CNC Jog Controls"
!macroend