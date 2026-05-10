[Code]

#include "Flags\IsCleanInstallFlagPresent.pas"
#include "Flags\IsClearAppDataFlagPresent.pas"
#include "Flags\IsForcePurgeFlagPresent.pas"
#include "Flags\IsForceRunFlagPresent.pas"
#include "Flags\IsNoRestoreFlagPresent.pas"

#include "Utils\IsDotNet10Installed.pas"
#include "Utils\RemoveExistingAppData.pas"
#include "Utils\RemoveExistingInstallation.pas"

#include "Install\CurStepChanged.pas"
#include "Install\InitializeSetup.pas"

#include "Uninstall\CurUninstallStepChanged.pas"

#include "Wizard\WizardPageLogic.pas"
#include "Wizard\CreateLicenseRadio.pas"
#include "Wizard\WizardPages.pas"