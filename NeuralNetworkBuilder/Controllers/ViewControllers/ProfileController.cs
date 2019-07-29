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
    public class ProfileController : Controller
    {
        public const string IndexPath = "/Profile";

        /// <summary>
        /// loads the homeview
        /// </summary>
        /// <returns>the homeview</returns>
        [Route(IndexPath)]
        public IActionResult Index()
        {
            return View("~/Views/Profile.cshtml");
        }
    }
}