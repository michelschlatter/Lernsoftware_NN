/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace Application.Helpers
{
    public static class PasswordHelper
    {
        private const int SaltLength = 32;

        /// <summary>
        /// Creates a Salt
        /// </summary>
        /// <returns>Salt</returns>
        public static string CreateSalt()
        {
            byte[] salt = new byte[SaltLength];
            using (RNGCryptoServiceProvider rdm = new RNGCryptoServiceProvider())
            {
                rdm.GetNonZeroBytes(salt);
            }
            return Convert.ToBase64String(salt);
        }

        /// <summary>
        /// Hashes the passwrod together with the salt
        /// </summary>
        /// <param name="password">password</param>
        /// <param name="salt">salt</param>
        /// <returns>the hashed password</returns>
        public static string HashPassword(string password, string salt)
        {
            HashAlgorithm algorithm = new SHA256Managed();
            byte[] pwBytes = Encoding.UTF8.GetBytes(password + salt);
            return Convert.ToBase64String(algorithm.ComputeHash(pwBytes));
        }

        //Source: https://stackoverflow.com/questions/54991/generating-random-passwords
        /// <summary
        /// Creates a random password
        /// </summary>
        /// <param name="length">length of the password</param>
        /// <returns>the random password</returns>
        public static string CreatePassword(int length)
        {
            string dictonary = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890%&/(*+";
            StringBuilder res = new StringBuilder();
            Random rnd = new Random();
            while (0 < length--)
            {
                res.Append(dictonary[rnd.Next(dictonary.Length)]);
            }
            return res.ToString();
        }
    }
}
