// ---------------------------------------------------------------
// CurStepChanged override
// ---------------------------------------------------------------
// Inno Setup already warns users if the chosen installation directory already exists, but it does
// not remove its contents if the user proceeds anyways. If the /FORCEPURGE flag is passed, we will
// forcefully remove all contents after the user proceeds.
procedure CurStepChanged(CurStep: TSetupStep);
var
  TargetDir: string;
begin
  if CurStep = ssInstall then
  begin
    if IsForcePurgeFlagPresent() then
    begin
      // The target installation directory chosen by the user exists by now
      TargetDir := ExpandConstant('{app}');
      
      if (Length(TargetDir) > 3) and DirExists(TargetDir) then
      begin
        Log('Purging directory: ' + TargetDir);
        // DelTree(Path, IsDir, DeleteFiles, DeleteSubdirs)
        if not DelTree(TargetDir, True, True, True) then
        begin
           Log('Could not purge directory: ' + TargetDir);
        end;
      end;
    end;
  end;
end;