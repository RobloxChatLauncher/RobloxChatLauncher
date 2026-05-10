// -----------------------------------------------------
// .NET Desktop Runtime installation check and installer
// -----------------------------------------------------
const
  DotNet10Url = '{#DotNet10Url}';

function IsDotNet10Installed(): Boolean;
var
  TmpFileName: String;
  ResultCode: Integer;
  OutputLines: TArrayOfString;
  I: Integer;
begin
  Result := False;
  TmpFileName := ExpandConstant('{tmp}\dotnet_runtimes.txt');

  // Execute dotnet --list-runtimes and pipe output to a temp file
  // Using 'cmd /c' allows us to use the '>' redirection operator
  if Exec(ExpandConstant('{cmd}'), '/c dotnet --list-runtimes > "' + TmpFileName + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if LoadStringsFromFile(TmpFileName, OutputLines) then
    begin
      Log('Resolved DotNet10Url: ' + DotNet10Url);
      for I := 0 to GetArrayLength(OutputLines) - 1 do
      begin
        // Look for the specific Desktop App string followed by version 10
        // WindowsDesktop is Desktop Runtime
        if Pos('Microsoft.WindowsDesktop.App 10.', OutputLines[I]) = 1 then
        begin
          Log('Found .NET 10 Runtime: ' + OutputLines[I]);
          Result := True;
          Break;
        end;
      end;
    end;
  end;
  
  // Clean up the temporary file
  DeleteFile(TmpFileName);
end;