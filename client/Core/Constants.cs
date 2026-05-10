using System.Buffers.Text;

namespace RobloxChatLauncher.Core
{
    public static class Constants
    {
#if DEBUG
        public static readonly string BASE_URL =
            Environment.GetEnvironmentVariable("BASE_URL")
            ?? "https://RobloxChatLauncher.onrender.com";
#else
        public const string BASE_URL = "https://RobloxChatLauncher.onrender.com";
#endif
        public const string REPO_OWNER = "RobloxChatLauncher";
        public const string REPO_NAME = "RobloxChatLauncher";
        public const string APP_GUID = "{B0BACAFE-D326-4A7B-B6BA-1437C0DEBABE}_is1";
    }
}