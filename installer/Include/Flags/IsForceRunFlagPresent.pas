// ---------------------------------------------------------------
// Helper function to check for the presence of the /FORCERUN flag
// ----------------------------------------------------------------
function IsForceRunFlagPresent(): Boolean;
var
  I: Integer;
begin
  Result := False;
  for I := 1 to ParamCount do
  begin
    if CompareText(ParamStr(I), '/FORCERUN') = 0 then
    begin
      Result := True;
      Break;
    end;
  end;
end;