// ------------------------------------------------------------
// Clickwrap agreements for Terms of Service and Privacy Policy
// ------------------------------------------------------------
var
  TermsPage, PrivacyPage: TOutputMsgMemoWizardPage;
  TermsAcceptedRadio, TermsNotAcceptedRadio: TRadioButton;
  PrivacyAcceptedRadio, PrivacyNotAcceptedRadio: TRadioButton;

{ Logic to enable/disable Next button based on selection }
procedure UpdateNextButton(Sender: TObject);
begin
  // If silent, we don't need to toggle the Next button's enabled state
  if WizardSilent then Exit;

  { We add 'Assigned' checks to ensure the pages exist before checking IDs }
  if Assigned(TermsPage) and (WizardForm.CurPageID = TermsPage.ID) then
    WizardForm.NextButton.Enabled := TermsAcceptedRadio.Checked
  else if Assigned(PrivacyPage) and (WizardForm.CurPageID = PrivacyPage.ID) then
    WizardForm.NextButton.Enabled := PrivacyAcceptedRadio.Checked;
end;

{ Helper function to skip pages during silent install }
function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if WizardSilent then
  begin
    if (Assigned(TermsPage) and (PageID = TermsPage.ID)) or 
       (Assigned(PrivacyPage) and (PageID = PrivacyPage.ID)) then
      Result := True;
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if not WizardSilent then
  begin
    { Ensure the Next button state is correct when the user navigates to these pages }
    if (CurPageID = TermsPage.ID) or (CurPageID = PrivacyPage.ID) then
    begin
      UpdateNextButton(nil);
    end;
  end;
end;
