/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Infrastructure;
using Infrastructure.Helpers;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Application.Dtos;
using Application.Helpers;
using Application.Services;
using Domain.Entities;

namespace Tests
{
    [TestClass]
    public class UserTest
    {
        /// <summary>
        /// Testmethod: Gets a User by Id 
        /// </summary>
        [TestMethod]
        public void GetUserById()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository) = InitDb("UserGetById");

            string email = "example@domain.com";
            string pw = "1234";
            User initialUser = CreateInitialUser(dbContext, email, pw);

            UserDto user = userService.GetById(initialUser.Id);
            Assert.IsTrue(user != null);
        }

        /// <summary>
        /// Testmethod: Creates a User with email and Password
        /// </summary>
        [TestMethod]
        public void CreateUser()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository) = InitDb("CreateUser");

            UserDto userDto = new UserDto();
            userDto.Email = "example@domain.com";
            userDto.Password = "1234";

            UserDto savedUser = userService.Create(userDto);
            User user = dbContext.Users.FirstOrDefault(x => x.Id == savedUser.Id);

            Assert.IsTrue(user != null);
        }


        /// <summary>
        /// Testmethod: Tests the login method
        /// </summary>
        [TestMethod]
        public void ValidLogin()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository) = InitDb("ValidateLogin");

            string email = "example@domain.com";
            string pw = "1%46/78H!";
            CreateInitialUser(dbContext, email, pw);
            UserDto userDto = userService.ValidLogin(email, pw);

            Assert.IsTrue(userDto != null);
                       
            UserDto noUser = userService.ValidLogin(email, "1234");
            Assert.IsTrue(noUser == null);
        }

        /// <summary>
        /// Testmethod: Tests the existing user
        /// </summary>
        [TestMethod]
        public void UpdateExistingUser()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository) = InitDb("UpdateExistingUser");

            string email = "example@domain.com";
            string pw = "1%46/78H!";
            User initialUser = CreateInitialUser(dbContext, email, pw);

            string newEmail = "max@muster.com";
            userService.UpdateEmail(initialUser.Id, newEmail);

            User user = dbContext.Users.FirstOrDefault(x => x.Email == newEmail);
            Assert.IsTrue(user != null);
        }

        /// <summary>
        /// Testmethod: updates the password from an existing user
        /// </summary>
        [TestMethod]
        public void UpdatePassword()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository) = InitDb("UpdateExistingUser");

            string email = "example@domain.com";
            string pw = "1%46/78H!";
            User initialUser = CreateInitialUser(dbContext, email, pw);
            string passwordHash = initialUser.Password;
            string newPw = "123456";
            userService.UpdatePassword(initialUser.Id, pw, newPw, newPw);

            User user = dbContext.Users.First(x => x.Id == initialUser.Id);
            Assert.AreNotEqual(passwordHash, user.Password);
        }

        /// <summary>
        /// Testmethod: resets the password from an existing user
        /// </summary>
        [TestMethod]
        public void ResetPassword()
        {
            (DataContext dbContext, UserService userService, UserRepository userRepository) = InitDb("ResetPassword");

            string email = "example@domain.com";
            string pw = "1%46/78H!";
            User initialUser = CreateInitialUser(dbContext, email, pw);
            string passwordHash = initialUser.Password;

            MockedSmtp mockedSmtp = new MockedSmtp();
            userService.ResetPassword(email, mockedSmtp);

            User user = dbContext.Users.First(x => x.Id == initialUser.Id);

            Assert.IsTrue(!string.IsNullOrEmpty(mockedSmtp.NewPassword));
            Assert.AreEqual(initialUser.Id, mockedSmtp.UserDto.Id); 
            Assert.AreNotEqual(passwordHash, user.Password); 
        }

        /// <summary>
        /// Creates the initial user for the testmethods
        /// </summary>
        /// <param name="dbContext">DbContext</param>
        /// <param name="email">Email</param>
        /// <param name="pw">Password</param>
        /// <returns></returns>
        private User CreateInitialUser(DataContext dbContext, string email, string pw)
        {
            User user = new User();
            user.Email = email;
            user.Salt = PasswordHelper.CreateSalt();
            user.Password = PasswordHelper.HashPassword(pw, user.Salt);
            dbContext.Users.Add(user);
            dbContext.SaveChanges();
            return user;
        }

        /// <summary>
        /// Creates the intial in Memory DB
        /// </summary>
        /// <param name="dbName"></param>
        /// <returns>DbContext, UserService, UserRepository</returns>
        private static (DataContext, UserService, UserRepository) InitDb(string dbName)
        {
            DataContext dbContext = new DataContext(DataContextFactory.GetInMemoryDb(dbName));
            UserRepository userRep = new UserRepository(dbContext);
            UserService userService = new UserService(userRep);
            return (dbContext, userService, userRep);
        }
    }
}
