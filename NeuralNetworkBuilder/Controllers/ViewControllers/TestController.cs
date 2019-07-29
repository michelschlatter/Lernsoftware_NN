/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuralNetworkBuilder.Controllers.ViewControllers
{
    public class TestController : Controller
    {
        public const string IndexPath = "/Tests";

        /// <summary>
        /// loads the testview
        /// </summary>
        /// <returns>the testview</returns>
        [Route(IndexPath)]
        public IActionResult Index()
        {
            return View("~/Views/Test.cshtml");
        }
    }
}
