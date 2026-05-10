// ---------------------------------------------------------------
// Helper to remove existing local app data
// ---------------------------------------------------------------
procedure RemoveExistingAppData();
var
  AppDataPath: string;
begin
  // Forcefully remove local app data folder
  AppDataPath := ExpandConstant('{localappdata}\RobloxChatLauncher');
  if (Length(AppDataPath) > 3) and DirExists(AppDataPath) then
  begin
    DelTree(AppDataPath, True, True, True);   
  end;
end;