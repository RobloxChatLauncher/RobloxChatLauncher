namespace RobloxChatLauncher.Utils
{
    public static class DebugConsole
    {
        public static bool Enabled = false;

        public static void WriteLine(string text)
        {
            if (!Enabled)
                return;

            try
            {
                Console.WriteLine(text);
            }
            catch (Exception) { }
        }
    }
}