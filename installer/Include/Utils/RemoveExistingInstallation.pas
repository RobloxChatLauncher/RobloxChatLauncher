// ---------------------------------------------------------------
// Helper to remove existing installation
// ---------------------------------------------------------------
procedure RemoveExistingInstallation();
var
  UninstallExe: string;
  UninstallKey: string;
  ResultCode: Integer;
begin
  UninstallKey := 'SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\{B0BACAFE-D326-4A7B-B6BA-1437C0DEBABE}_is1';

  // Uninstall the existing application if it exists by running the uninstaller silently
  if RegQueryStringValue(HKLM, UninstallKey, 'UninstallString', UninstallExe) then
  begin
    UninstallExe := RemoveQuotes(UninstallExe);
    
    if FileExists(UninstallExe) then
    begin
      Exec(UninstallExe, '/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /NORESTORE', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
  end;
end;