/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Dtos;
using Application.Services;
using Infrastructure;
using Infrastructure.Helpers;
using Infrastructure.Repositories;
using Infrastructure.Smtp;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace NeuralNetworkBuilder.Controllers.API
{

    [ApiController]
    public class AccountController : BaseController
    {
        protected IConfiguration Configuration;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration (Appsettings.json)</param>
        public AccountController(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        /// <summary>
        /// Rest API which gives you the current logged in user
        /// </summary>
        /// <returns>current User</returns>
        [Route("api/Account")]
        [HttpGet]
        public UserDto Get()
        {
            UserService userService = new UserService(new UserRepository(DbContext));
            UserDto user = null;
            if (UserId.HasValue)
            {
                user = userService.GetById(UserId.Value);
            }
            return user;
        }

        /// <summary>
        /// RPC Async Login Method
        /// </summary>
        /// <param name="userDto">the user with email and password</param>
        /// <returns>string: OK or Exception Message</returns>
        [Route("api/Account/Login")]
        [HttpPost]
        public async Task<string> LoginAsync([FromBody] UserDto userDto)
        {
            try
            {
                UserService userService = new UserService(new UserRepository(DbContext));
                UserDto user = userService.ValidLogin(userDto.Email, userDto.Password);


                if (user != null)
                {
                    var claims = new List<Claim>
                {
                   new Claim(ClaimTypes.NameIdentifier, user.Email),
                   new Claim(ClaimTypes.Name, user.Id.ToString())
                };
                    ClaimsIdentity userIdentity = new ClaimsIdentity(claims, "Login");
                    ClaimsPrincipal principal = new ClaimsPrincipal(userIdentity);

                    await HttpContext.SignInAsync(principal);
                    return "ok";
                }
                else
                {
                    throw new Exception("Wrong Password or Email!");
                }
            }
            finally
            {
                DbContext.Dispose();
            }
        }

        /// <summary>
        /// RPC Logout
        /// </summary>
        /// <returns>string: OK</returns>
        [Route("api/Account/Logout")]
        [HttpPost]
        public async Task<string> Logout()
        {
            await HttpContext.SignOutAsync();
            return "ok";
        }

        /// <summary>
        /// RPC Resets the password and sends it to the user
        /// </summary>
        [Route("api/Account/ResetPassword")]
        [HttpPut]
        public void ResetPassword([FromBody]string email)
        {
            UserService userService = new UserService(new UserRepository(DbContext));
            userService.ResetPassword(email, new Smtp(
                Configuration.GetValue<string>("SmtpHost"),
                Configuration.GetValue<int>("SmtpPort"),
                Configuration.GetValue<string>("SmtpUserName"),
                Configuration.GetValue<string>("SmtpPassword"),
                Configuration.GetValue<string>("SmtpMailFrom"),
                Configuration.GetValue<string>("ApplicationName")));
        }

        /// <summary>
        /// RPC update Password
        /// </summary>
        [Route("api/Account/UpdatePassword")]
        [HttpPut]
        public void UpdatePassword([FromBody] AccountModel accountModel)
        {
            UserService userService = new UserService(new UserRepository(DbContext));
            if (UserId.HasValue)
            {
                userService.UpdatePassword(UserId.Value, accountModel.OldPassword, accountModel.Password, accountModel.Password2);
            }
            else
            {
                throw new Exception("User not found. Please Login.");
            }
        }

        /// <summary>
        /// RPC update Password
        /// </summary>
        [Route("api/Account/UpdateEmail")]
        [HttpPut]
        public UserDto UpdateEmail([FromBody] string email)
        {
            UserService userService = new UserService(new UserRepository(DbContext));
            if (UserId.HasValue)
            {
               return userService.UpdateEmail(UserId.Value, email);
            }
            else
            {
                throw new Exception("User not found. Please Login.");
            }
        }

        /// <summary>
        /// RPC Register Method
        /// </summary>
        /// <param name="registerModel">RegisterModel with email Password and ConfirmPassword</param>
        /// <returns>The saved User</returns>
        [Route("api/Account/Register")]
        [HttpPost]
        public UserDto Register([FromBody] AccountModel registerModel)
        {
            try
            {
                if (registerModel.Password == registerModel.Password2)
                {
                        UserService userService = new UserService(new UserRepository(DbContext));
                        UserDto user = userService.Create(new UserDto()
                        {
                            Email = registerModel.Email,
                            Password = registerModel.Password
                        });
                        return user;
                }
                else
                {
                    throw new Exception("Passwords are not equal!");
                }
            }
            finally
            {
                DbContext.Dispose();
            }
        }

        #region REST Models

        public class AccountModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string Password2 { get; set; }
            public string OldPassword { get; set; }
        }

        #endregion
    }
}