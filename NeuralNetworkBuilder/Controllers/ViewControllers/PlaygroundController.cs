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
    public class PlaygroundController : Controller
    {
        public const string IndexPath = "/playground/";

        /// <summary>
        /// Loads the playground view
        /// </summary>
        /// <returns>the playground view</returns>
        [Route(IndexPath)]
        public IActionResult Index()
        {
            return View("~/Views/Playground.cshtml");
        }
    }
}