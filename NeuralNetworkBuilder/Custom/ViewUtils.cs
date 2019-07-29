/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuralNetworkBuilder.Custom
{
    public static class ViewUtils
    {

        /// <summary>
        /// Checks if a user is logged in
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <returns>true if the user is authenticated</returns>
        public static bool IsAuthenticated(HttpContext context)
        {
            bool isAuthenticated = false;
            if (!string.IsNullOrEmpty(context.User.Identity.Name))
            {
                if(int.TryParse(context.User.Identity.Name, out int id))
                {
                    isAuthenticated = id > 0;
                }
            }

            return isAuthenticated;
        }

        /// <summary>
        /// Gets the current application version from the appsetting.json
        /// </summary>
        /// <returns>Application Version</returns>
        public static string GetVersion()
        {
            return Startup.Configuration?.GetValue<string>("ApplicationVersion");
        }

        /// <summary>
        /// Loads the Application Name from the AppSettings.json File
        /// </summary>
        /// <returns>ApplicationName</returns>
        public static string GetApplicationName()
        {
           return Startup.Configuration?.GetValue<string>("ApplicationName") ?? "Blueneurons.ch";
        }

        /// <summary>
        /// Checks if the navigation item is active
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <param name="path">Path to check</param>
        /// <returns>active or ''</returns>
        public static string IsNavActive(HttpContext context, string path)
        {
            return context.Request.Path.Value.ToLower() == path.ToLower() ? "active" : "";
        }

        /// <summary>
        /// Checks if the current browser is IE
        /// </summary>
        /// <param name="context">HttpContext</param>
        /// <returns>true if browser is IE</returns>
        public static bool IsIe(HttpContext context)
        {
            bool result = false;

            if (context.Request.Headers.ContainsKey("User-Agent"))
            {
                string userAgent = context.Request.Headers["User-Agent"].ToString();
                result = userAgent.Contains("Trident/", StringComparison.InvariantCultureIgnoreCase) ||
                    userAgent.Contains("MSIE", StringComparison.InvariantCultureIgnoreCase);
            }
            return result;
        }
    }
}
