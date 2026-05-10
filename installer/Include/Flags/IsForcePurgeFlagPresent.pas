// --------------------------------------------------------------------
// Helper function to check for the presence of the /FORCEPURGE flag
// --------------------------------------------------------------------
function IsForcePurgeFlagPresent(): Boolean;
var
  I: Integer;
begin
  Result := False;
  for I := 1 to ParamCount do
  begin
    if CompareText(ParamStr(I), '/FORCEPURGE') = 0 then
    begin
      Result := True;
      Break;
    end;
  end;
end;