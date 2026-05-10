// ------------------------------------------------------------
// Restore Roblox/Bootstrapper registry on uninstall
// ------------------------------------------------------------
// Before uninstalling, we silently restore the original Roblox
// or Bootstrapper registry key so that the Roblox client continues
// to work after our app is uninstalled.
procedure CurUninstallStepChanged(UninstallStep: TUninstallStep);
var
  ResultCode: Integer;
  AppPath: string;
begin
  // This triggers at the very beginning of the uninstallation process
  if UninstallStep = usUninstall then
  begin
  if IsNoRestoreFlagPresent() then
    begin
      Log('Skipping registry restoration due to /NORESTORE flag.');
      Exit; 
    end;

    // Points to executable in the installation directory
    AppPath := ExpandConstant('{app}\RobloxChatLauncher.exe');
    
    if FileExists(AppPath) then
    begin
      // Log for debugging (visible in the uninstall log)
      Log('Launching app to restore registry: ' + AppPath);
      
      // Execute with the --uninstall flag 
      // SW_HIDE makes it invisible to the user
      // ewWaitUntilTerminated ensures the registry is fixed before files are deleted
      if not Exec(AppPath, '--uninstall', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
      begin
        Log('Failed to launch restoration app. Result code: ' + IntToStr(ResultCode));
      end;
    end
    else
    begin
      Log('Restoration app not found at: ' + AppPath);
    end;
  end;
end;