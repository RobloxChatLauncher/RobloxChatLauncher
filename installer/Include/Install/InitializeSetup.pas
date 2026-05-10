// ---------------------------------------------------------------
// InitializeSetup override
// ---------------------------------------------------------------
function InitializeSetup(): Boolean;
var
  ErrorCode: Integer;
begin
  Result := True;

  // If /CLEANINSTALL is passed, forcefully remove old installation before installing new version
  if IsCleanInstallFlagPresent() then
  begin
    RemoveExistingInstallation();
  end;

  // If /CLEARAPPDATA is passed, forcefully remove local app data before installation
  if IsClearAppDataFlagPresent() then
  begin
    RemoveExistingAppData();
  end;

  if not IsDotNet10Installed() then
  begin
    // If the installer was launched with /SILENT or /VERYSILENT, skip the popups
    if WizardSilent then
    begin
      Log('WARNING: .NET 10.0 not found during silent install.');
      Result := True;
      Exit;
    end;
    
    if MsgBox('.NET Desktop Runtime 10.0 was not detected.' #13#13 +
              'Would you like to download and install it now?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', DotNet10Url, '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
      
    // Show instructions after opening the link
    MsgBox('The .NET Desktop Runtime 10.0 installer will be downloaded in the background. ' +
      'Please run the installer from your Downloads folder and then rerun this installer.',
      mbInformation, MB_OK);
           
      Result := False;
    end
    else
    begin
      MsgBox('Installation cannot proceed without .NET Desktop Runtime 10.0.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;