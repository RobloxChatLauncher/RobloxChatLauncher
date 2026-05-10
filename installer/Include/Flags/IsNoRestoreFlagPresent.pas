// --------------------------------------------------------------------
// Helper function to check for the presence of the /NORESTORE flag (for uninstallation)
// --------------------------------------------------------------------
function IsNoRestoreFlagPresent(): Boolean;
var
  I: Integer;
begin
  Result := False;
  for I := 1 to ParamCount do
  begin
    if CompareText(ParamStr(I), '/NORESTORE') = 0 then
    begin
      Result := True;
      Break;
    end;
  end;
end;