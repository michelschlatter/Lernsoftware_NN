/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace NeuralNetworkBuilder.Controllers.ViewControllers
{
    public class AccountController : Controller
    {
        /// <summary>
        /// loads the Loginview
        /// </summary>
        /// <returns> the Loginview</returns>
        [Route("Account/Login")]
        public IActionResult Index()
        {
            return View("~/Views/Login.cshtml");
        }
    }
}