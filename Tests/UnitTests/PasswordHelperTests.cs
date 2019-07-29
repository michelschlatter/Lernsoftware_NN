/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Helpers;
using Infrastructure.Helpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Tests
{
    [TestClass]
    public class PasswordHelperTest
    {
        /// <summary>
        /// Testmethod: Tests if the Password Hashing Algorithm returns the same Hash
        /// </summary>
        [TestMethod]
        public void PasswordEncryption()
        {
            string password = "PF5Zn[}fJnX79{`#";
            string password2 = "PF5Zn[}fJnX79{`/";
            string salt = "wertzu63783%ç&/";
            string salt2 = "%&/zzTTZUJKMBjh";

            string hash = PasswordHelper.HashPassword(password, salt);
            string hash2 = PasswordHelper.HashPassword(password, salt);
            string hash3 = PasswordHelper.HashPassword(password2, salt);
            string hash4 = PasswordHelper.HashPassword(password, salt2);

            Assert.AreEqual(hash, hash2);
            Assert.AreNotEqual(hash2, hash3);
            Assert.AreNotEqual(hash2, hash4);
        }

        /// <summary>
        /// Testmethod: Creates a Password 
        /// </summary>
        [TestMethod]
        public void CreatePassword()
        {
            string password = PasswordHelper.CreatePassword(15);
            Assert.IsTrue(password.Length == 15);
        }

        /// <summary>
        /// Testmethod: Creates a Salt
        /// </summary>
        [TestMethod]
        public void CreateSalt()
        {
            string salt = PasswordHelper.CreateSalt();
            Assert.IsTrue(!string.IsNullOrEmpty(salt));
        }


    }
}
