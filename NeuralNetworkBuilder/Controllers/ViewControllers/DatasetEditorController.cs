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
    public class DatasetEditorController : Controller
    {
        public const string IndexPath = "/dataseteditor/";

        /// <summary>
        /// Loads the dataseteditorview
        /// </summary>
        /// <returns>the dataseteditorview</returns>
        [Route(IndexPath)]
        public IActionResult Index()
        {
            return View("~/Views/DatasetEditor.cshtml");
        }
    }
}