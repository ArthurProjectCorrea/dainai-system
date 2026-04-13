using System;
using System.Linq;
using System.Security.Cryptography;

namespace Api.Application.Utils
{
    public static class PasswordGenerator
    {
        private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

        public static string Generate(int length = 12)
        {
            var buffer = new char[length];

            for (var index = 0; index < length; index++)
            {
                buffer[index] = Chars[RandomNumberGenerator.GetInt32(Chars.Length)];
            }

            return new string(buffer);
        }
    }
}
