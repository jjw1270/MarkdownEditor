#ifndef AppVersion
  #error AppVersion is required
#endif
#ifndef SourceDir
  #error SourceDir is required
#endif
#ifndef RepoRoot
  #error RepoRoot is required
#endif
#ifndef OutputDir
  #error OutputDir is required
#endif
#ifndef WebView2Bootstrapper
  #error WebView2Bootstrapper is required
#endif

[Setup]
AppId={{B33FB6E9-7620-4348-B504-AC4770CC586C}
AppName=MarkDownEditor
AppVersion={#AppVersion}
AppPublisher=jjw1270
AppPublisherURL=https://github.com/jjw1270/MarkdownEditor
AppSupportURL=https://github.com/jjw1270/MarkdownEditor/issues
AppUpdatesURL=https://github.com/jjw1270/MarkdownEditor/releases/latest
DefaultDirName={localappdata}\Programs\MarkDownEditor
DefaultGroupName=MarkDownEditor
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0.17763
ChangesAssociations=yes
CloseApplications=yes
RestartApplications=no
SetupIconFile={#RepoRoot}\src\Icon_New.ico
UninstallDisplayIcon={app}\MarkDownEditor.exe
OutputDir={#OutputDir}
OutputBaseFilename=MarkDownEditor-Setup-x64
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
VersionInfoVersion={#AppVersion}.0
VersionInfoCompany=jjw1270
VersionInfoDescription=MarkDownEditor installer
VersionInfoProductName=MarkDownEditor
VersionInfoProductVersion={#AppVersion}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#SourceDir}\MarkDownEditor.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceDir}\web\*"; DestDir: "{app}\web"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#RepoRoot}\installer\installed.marker"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#WebView2Bootstrapper}"; DestDir: "{tmp}"; DestName: "MicrosoftEdgeWebview2Setup.exe"; Flags: deleteafterinstall

[InstallDelete]
; 예전에 같은 경로에 포터블판을 풀었더라도 설치판은 Evergreen WebView2만 사용한다.
Type: filesandordirs; Name: "{app}\Runtime"

[Icons]
Name: "{group}\MarkDownEditor"; Filename: "{app}\MarkDownEditor.exe"; WorkingDir: "{app}"
Name: "{autodesktop}\MarkDownEditor"; Filename: "{app}\MarkDownEditor.exe"; WorkingDir: "{app}"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Classes\Applications\MarkDownEditor.exe"; ValueType: string; ValueName: "FriendlyAppName"; ValueData: "MarkDownEditor"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\Applications\MarkDownEditor.exe\shell\open\command"; ValueType: string; ValueData: """{app}\MarkDownEditor.exe"" ""%1"""
Root: HKCU; Subkey: "Software\Classes\Applications\MarkDownEditor.exe\SupportedTypes"; ValueType: string; ValueName: ".md"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Classes\Applications\MarkDownEditor.exe\SupportedTypes"; ValueType: string; ValueName: ".markdown"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Classes\MarkDownEditor.Document"; ValueType: string; ValueData: "Markdown document"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\MarkDownEditor.Document\DefaultIcon"; ValueType: string; ValueData: "{app}\MarkDownEditor.exe,0"
Root: HKCU; Subkey: "Software\Classes\MarkDownEditor.Document\shell\open\command"; ValueType: string; ValueData: """{app}\MarkDownEditor.exe"" ""%1"""
Root: HKCU; Subkey: "Software\Classes\.md\OpenWithProgids"; ValueType: string; ValueName: "MarkDownEditor.Document"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Classes\.markdown\OpenWithProgids"; ValueType: string; ValueName: "MarkDownEditor.Document"; ValueData: ""; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\MarkDownEditor\Capabilities"; ValueType: string; ValueName: "ApplicationName"; ValueData: "MarkDownEditor"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\MarkDownEditor\Capabilities"; ValueType: string; ValueName: "ApplicationDescription"; ValueData: "A fast, private Markdown editor for Windows"
Root: HKCU; Subkey: "Software\MarkDownEditor\Capabilities\FileAssociations"; ValueType: string; ValueName: ".md"; ValueData: "MarkDownEditor.Document"
Root: HKCU; Subkey: "Software\MarkDownEditor\Capabilities\FileAssociations"; ValueType: string; ValueName: ".markdown"; ValueData: "MarkDownEditor.Document"
Root: HKCU; Subkey: "Software\RegisteredApplications"; ValueType: string; ValueName: "MarkDownEditor"; ValueData: "Software\MarkDownEditor\Capabilities"; Flags: uninsdeletevalue

[Run]
Filename: "{tmp}\MicrosoftEdgeWebview2Setup.exe"; Parameters: "/silent /install"; StatusMsg: "Installing Microsoft Edge WebView2 Runtime..."; Flags: runhidden waituntilterminated; Check: not IsWebView2Installed; AfterInstall: VerifyWebView2Installed
Filename: "{app}\MarkDownEditor.exe"; Description: "{cm:LaunchProgram,MarkDownEditor}"; Flags: nowait postinstall skipifsilent

[Code]
function IsWebView2Installed: Boolean;
var
  Version: String;
  ClientKey: String;
begin
  ClientKey := 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';
  Result :=
    (RegQueryStringValue(HKCU, ClientKey, 'pv', Version) or
     RegQueryStringValue(HKLM32, ClientKey, 'pv', Version)) and
    (Version <> '') and (Version <> '0.0.0.0');
end;

procedure VerifyWebView2Installed;
begin
  if not IsWebView2Installed then
    RaiseException('Microsoft Edge WebView2 Runtime could not be installed. Check the Internet connection and run Setup again.');
end;
