/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Dtos;
using Application.Helpers;
using Application.Interfaces;
using Application.Mapping;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.Services
{
    public class UserService
    {
        readonly IUserRepository _userRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userRepository">UserRepository</param>
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        /// <summary>
        /// Gets the User by id
        /// </summary>
        /// <param name="id">userid</param>
        /// <returns>User</returns>
        public UserDto GetById(int id)
        {
            return UserMapper.ToDto(_userRepository.GetById(id), false);
        }

        /// <summary>
        /// Updates the email of a user
        /// </summary>
        /// <param name="userId">userid</param>
        /// <param name="email">email</param>
        /// <returns>user</returns>
        public UserDto UpdateEmail(int userId, string email)
        {
            ValidateEmail(email);
            User user = _userRepository.GetById(userId);
            if (user != null)
            {
                user.Email = email;
                user.Modified = DateTime.Now;
                _userRepository.DataContext.Commit();
            }
            else
            {
                throw new Exception("User not found");
            }
            return UserMapper.ToDto(user, false);
        }

        /// <summary>
        /// Checks the oldpw and the comparison of the password1 and password 2 (throws exception)
        /// Updates the password of the user 
        /// </summary>
        /// <param name="userId">userid</param>
        /// <param name="oldPw">oldPw</param>
        /// <param name="pw1">New password</param>
        /// <param name="pw2">Confirm new password</param>
        public void UpdatePassword(int userId, string oldPw, string pw1, string pw2)
        {
            User user = _userRepository.GetById(userId);
            if (PasswordHelper.HashPassword(oldPw, user.Salt) == user.Password)
            {
                if (string.IsNullOrEmpty(pw1) || pw1.Length < 4)
                {
                    throw new Exception("The password must have 4 or more characters");
                }
                else
                {
                    if (pw1 == pw2)
                    {
                        user.Password = PasswordHelper.HashPassword(pw1, user.Salt);
                        user.Modified = DateTime.Now;
                        _userRepository.DataContext.Commit();
                    }
                    else
                    {
                        throw new Exception("Password and confirmation password do not match.");
                    }

                }
            }
            else
            {
                throw new Exception("Wrong old password.");
            }
        }

        /// <summary>
        /// Resets the password in the db and sends it to the user
        /// </summary>
        /// <param name="email">Email</param>
        /// <param name="sender">Sender</param>
        public void ResetPassword(string email, ISender sender)
        {
            ValidateEmail(email);
            User user = _userRepository.FindByEmail(email);
            if (user != null)
            {
                string pw = PasswordHelper.CreatePassword(6);
                user.Salt = PasswordHelper.CreateSalt();
                user.Password = PasswordHelper.HashPassword(pw, user.Salt);
                user.Modified = DateTime.Now;
                _userRepository.DataContext.Commit();
                sender.SendPassword(UserMapper.ToDto(user, false), pw);
            }
        }

        /// <summary>
        /// Creates a new User in the database
        /// </summary>
        /// <param name="userDto">User</param>
        /// <returns>Created User</returns>
        public UserDto Create(UserDto userDto)
        {
            ValidateEmail(userDto.Email);
            if (_userRepository.FindByEmail(userDto.Email) == null)
            {
                if (string.IsNullOrEmpty(userDto.Password) || userDto.Password.Length < 4)
                {
                    throw new Exception("The password must have 4 or more characters");
                }
                else
                {
                    string salt = PasswordHelper.CreateSalt();
                    User user = new User()
                    {
                        Email = userDto.Email,
                        Salt = salt,
                        Password = PasswordHelper.HashPassword(userDto.Password, salt),
                        Created = DateTime.Now,
                        Modified = DateTime.Now
                    };
                    _userRepository.Add(user);
                    _userRepository.DataContext.Commit();

                    userDto.Id = user.Id;
                    return userDto;
                }
            }
            else
            {
                throw new Exception("User with this email adress already exists.");
            }
        }

        /// <summary>
        /// Validates the login
        /// </summary>
        /// <param name="email">email</param>
        /// <param name="password">password</param>
        /// <returns>the user if the login was successfull</returns>
        public UserDto ValidLogin(string email, string password)
        {
            UserDto userDto = null;
            User user = _userRepository.FindByEmail(email);
            if (user != null)
            {
                if (PasswordHelper.HashPassword(password, user.Salt) == user.Password)
                {
                    userDto = UserMapper.ToDto(user, false);
                }
            }
            return userDto;
        }

        /// <summary>
        /// Validates the email
        /// </summary>
        /// <param name="email">email</param>
        private void ValidateEmail(string email)
        {
            if (!new EmailAddressAttribute().IsValid(email))
            {
                throw new Exception($"{email} is not a valid email adress.");
            }
        }

    }
}
