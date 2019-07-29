/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Dtos;
using Application.Services;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace NeuralNetworkBuilder.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class AuthControllerBase : BaseController
    {
        /// <summary>
        /// Returns the current logged in User
        /// </summary>
        public UserDto CurrentUser
        {
            get {
              return new UserService(new UserRepository(DbContext))
                    .GetById(Convert.ToInt32(HttpContext.User.Identity.Name));
            }
        }
    }
}