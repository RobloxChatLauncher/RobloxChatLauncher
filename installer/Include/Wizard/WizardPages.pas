procedure InitializeWizard();
var
  TermsPath, PrivacyPath: string;
begin

  { wpLicense means it comes right after the standard License page }
  TermsPage := CreateOutputMsgMemoPage(wpLicense, 
    'Terms of Service Agreement', 'Please read the following important information before continuing.',
    'Please read the following Terms of Service Agreement. You must accept the terms of this agreement before continuing with the installation.', '');

  { We use TermsPage.ID so this appears right after the Terms page }
  PrivacyPage := CreateOutputMsgMemoPage(TermsPage.ID, 
    'Privacy Policy Agreement', 'Please read the following important information before continuing.',
    'Please read the following Privacy Policy Agreement. You must accept the terms of this agreement before continuing with the installation.', '');

  if not WizardSilent then
  begin
    { --- 1. TERMS OF SERVICE PAGE --- }
    TermsPage.RichEditViewer.Height := WizardForm.LicenseMemo.Height;
    
    ExtractTemporaryFile('TERMS');
    TermsPath := ExpandConstant('{tmp}\TERMS');
    TermsPage.RichEditViewer.Lines.LoadFromFile(TermsPath);

    TermsAcceptedRadio := CreateLicenseRadio(TermsPage, WizardForm.LicenseAcceptedRadio, 'I accept the agreement');
    TermsNotAcceptedRadio := CreateLicenseRadio(TermsPage, WizardForm.LicenseNotAcceptedRadio, 'I do not accept the agreement');
    TermsNotAcceptedRadio.Checked := True;

    { --- 2. PRIVACY POLICY PAGE --- }
    PrivacyPage.RichEditViewer.Height := WizardForm.LicenseMemo.Height;

    ExtractTemporaryFile('PRIVACY');
    PrivacyPath := ExpandConstant('{tmp}\PRIVACY');
    PrivacyPage.RichEditViewer.Lines.LoadFromFile(PrivacyPath);

    PrivacyAcceptedRadio := CreateLicenseRadio(PrivacyPage, WizardForm.LicenseAcceptedRadio, 'I accept the agreement');
    PrivacyNotAcceptedRadio := CreateLicenseRadio(PrivacyPage, WizardForm.LicenseNotAcceptedRadio, 'I do not accept the agreement');
    PrivacyNotAcceptedRadio.Checked := True;
  end;
end;