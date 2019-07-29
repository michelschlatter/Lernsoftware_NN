/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace NeuralNetworkBuilder
{
    public class Program
    {
        /// <summary>
        /// Programm entry point
        /// </summary>
        /// <param name="args">args for the Webhost</param>
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        /// <summary>
        /// Builds the webhost
        /// </summary>
        /// <param name="args">args for the Webhost</param>
        /// <returns>Webhost</returns>
        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(ConfigConfiguration)
                .UseStartup<Startup>();

        /// <summary>
        /// Sets the appsettings dependend on the environment
        /// </summary>
        /// <param name="ctx">Webhostingbuildercontext</param>
        /// <param name="config">ConfigurationBuilder</param>
        public static void ConfigConfiguration(WebHostBuilderContext ctx, IConfigurationBuilder config)
        {
            config.SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{ctx.HostingEnvironment.EnvironmentName}.json", optional: true);
        }
    }
}
