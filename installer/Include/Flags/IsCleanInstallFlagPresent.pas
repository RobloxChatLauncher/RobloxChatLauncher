// -------------------------------------------------------------------
// Helper function to check for the presence of the /CLEANINSTALL flag
// -------------------------------------------------------------------
function IsCleanInstallFlagPresent(): Boolean;
var
  I: Integer;
begin
  Result := False;
  for I := 1 to ParamCount do
  begin
    if CompareText(ParamStr(I), '/CLEANINSTALL') = 0 then
    begin
      Result := True;
      Break;
    end;
  end;
end;