// --------------------------------------------------------------------
// Helper function to check for the presence of the /CLEARAPPDATA flag
// --------------------------------------------------------------------
function IsClearAppDataFlagPresent(): Boolean;
var
  I: Integer;
begin
  Result := False;
  for I := 1 to ParamCount do
  begin
    if CompareText(ParamStr(I), '/CLEARAPPDATA') = 0 then
    begin
      Result := True;
      Break;
    end;
  end;
end;