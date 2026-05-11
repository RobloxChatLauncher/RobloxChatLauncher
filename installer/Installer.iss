#define AppVersion "1.0.0" ; Do not manually update this version; it is auto-updated by release workflow
#define DotNet10Url "https://aka.ms/dotnet-core-applaunch?missing_runtime=true&arch=x64&rid=win11-x64&apphost_version=10.0.0&gui=true"
#define Root ".."

[Setup]
; In Inno Setup you must use double curly braces at the start of the GUID to escape the character
AppId={{B0BACAFE-D326-4A7B-B6BA-1437C0DEBABE}
AppName=Roblox Chat Launcher
AppVersion={#AppVersion}
AppVerName=Roblox Chat Launcher
DefaultDirName={pf}\RobloxChatLauncher
DefaultGroupName=Roblox Chat Launcher
OutputDir=.
OutputBaseFilename=RobloxChatLauncherInstaller
Compression=lzma
SolidCompression=yes
LicenseFile={#Root}\LICENSE
SetupIconFile={#Root}\assets\brand\rcl_icon-variable.ico
UninstallDisplayIcon={app}\RobloxChatLauncher.exe
CloseApplications=yes

[Files]
Source: "{#Root}\LICENSE"; DestDir: "{app}"
Source: "{#Root}\PRIVACY"; DestDir: "{app}"
Source: "{#Root}\TERMS"; DestDir: "{app}"
Source: "{#Root}\client\Fonts\OFL.txt"; DestDir: "{app}"
; Copy everything from the publish folder including resource folders
Source: "{#Root}\client\bin\Release\net10.0-windows\publish\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{autoprograms}\Roblox Chat Launcher"; Filename: "{app}\RobloxChatLauncher.exe"; IconFileName: "{app}\RobloxChatLauncher.exe"; Parameters: "--launch-homepage"
Name: "{autodesktop}\Roblox Chat Launcher"; Filename: "{app}\RobloxChatLauncher.exe"; IconFileName: "{app}\RobloxChatLauncher.exe"; Parameters: "--launch-homepage"

[Run]
; Silently run the app to register it as the Roblox launcher
Filename: "{app}\RobloxChatLauncher.exe"; Flags: nowait runhidden; Check: not IsForceRunFlagPresent

; Runs with --force-run arg if /FORCERUN IS passed to the installer
Filename: "{app}\RobloxChatLauncher.exe"; Parameters: "--force-run"; Flags: nowait postinstall; Check: IsForceRunFlagPresent

[Code]
#include "Include\Init.iss"