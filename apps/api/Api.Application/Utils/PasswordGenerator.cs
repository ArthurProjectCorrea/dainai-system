using System;
using System.Linq;
using System.Security.Cryptography;

namespace Api.Application.Utils
{
    public static class PasswordGenerator
    {
        private const string Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private const string Lower = "abcdefghijklmnopqrstuvwxyz";
        private const string Digits = "0123456789";
        private const string Special = "!@#$%^&*()";
        private const string All = Upper + Lower + Digits + Special;

        public static string Generate(int length = 12)
        {
            if (length < 4) length = 4;
            var buffer = new char[length];

            // Ensure at least one of each
            buffer[0] = Upper[RandomNumberGenerator.GetInt32(Upper.Length)];
            buffer[1] = Lower[RandomNumberGenerator.GetInt32(Lower.Length)];
            buffer[2] = Digits[RandomNumberGenerator.GetInt32(Digits.Length)];
            buffer[3] = Special[RandomNumberGenerator.GetInt32(Special.Length)];

            for (var index = 4; index < length; index++)
            {
                buffer[index] = All[RandomNumberGenerator.GetInt32(All.Length)];
            }

            // Shuffle
            return new string(buffer.OrderBy(_ => RandomNumberGenerator.GetInt32(100)).ToArray());
        }
    }
}
