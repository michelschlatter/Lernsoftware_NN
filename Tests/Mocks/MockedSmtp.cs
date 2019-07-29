/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Text;
using Application.Dtos;
using Application.Interfaces;

namespace Tests
{
    public class MockedSmtp : ISender
    {
        public string NewPassword { get; set; }
        public UserDto UserDto { get; set; }

        /// <summary>
        /// Mock the SMTP Sender for Testing Purposes, sets the given Parameter
        /// </summary>
        /// <param name="user"></param>
        /// <param name="newPassword"></param>
        public void SendPassword(UserDto user, string newPassword)
        {
            UserDto = user;
            NewPassword = newPassword;
        }
    }
}
