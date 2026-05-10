{ Helper function to create and place the radio buttons }
function CreateLicenseRadio(ParentPage: TOutputMsgMemoWizardPage; Original: TRadioButton; Text: string): TRadioButton;
begin
  Result := TRadioButton.Create(WizardForm);
  Result.Parent := ParentPage.Surface;
  Result.Caption := Text;
  Result.Left := Original.Left;
  Result.Top := Original.Top;
  Result.Width := Original.Width;
  Result.Height := Original.Height;
  Result.Anchors := Original.Anchors;
  Result.OnClick := @UpdateNextButton;
end;