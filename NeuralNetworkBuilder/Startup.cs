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
using Application.Dtos;
using Application.Services;
using Domain.Entities;
using Infrastructure;
using Infrastructure.Helpers;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NeuralNetworkBuilder.Custom;

namespace NeuralNetworkBuilder
{
    public class Startup
    {
       
        private IHostingEnvironment _env;

        const string NumbersDataset = "Numbers";
        const string ValidationNumbersDataset = "Validation Numbers";
        const string ValidationLettersDataset = "Validation Letters";
        const string LettersDataset = "Letters";
        const string XorDataset = "XOR";
        const string OrDataset = "OR";
        const string DiceDataset = "Dice";
        public static string ConnectionString { get; private set; }
        public static IConfiguration Configuration;
        /// <summary>
        /// Statrtup Class Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        /// <param name="env">Environment</param>
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            _env = env;
        }

      

        /// <summary>
        /// Configures the needed services for the webapp and creates the initial data for the database
        /// </summary>
        /// <param name="services">servicecollection</param>
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                  .AddCookie(options =>
                  {
                      options.LoginPath = "/Login/UserLogin/";                   
                      options.Cookie.Expiration = TimeSpan.FromDays(14);
                      options.Cookie.HttpOnly = true;
                  });


            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            if (_env.IsEnvironment("Development"))
            {
                ConnectionString = Configuration.GetConnectionString("DevelopmentDb");
            }
            else if (_env.IsEnvironment("Test"))
            {
                ConnectionString = Configuration.GetConnectionString("TestDb");
            }
            else if (_env.IsEnvironment("Production"))
            {
                ConnectionString = Configuration.GetConnectionString("ProductionDb");
            }
            else
            {
                throw new Exception("Environment not defined.");
            }


            using (DataContext dbContext = DataContextFactory.GetDataContext(ConnectionString))
            {
                DbCreator.CreateDbIfNotExist(dbContext, _env.IsEnvironment("Development"));
                UserService userService = new UserService(new UserRepository(dbContext));
                DatasetService dsService = new DatasetService(new DatasetRepository(dbContext));

                if (Configuration.GetValue<bool>("RegenerateStaticDatasets"))
                {
                    DatasetDto xor = dsService.GetByName(XorDataset);
                    DatasetDto dice = dsService.GetByName(DiceDataset);
                    DatasetDto or = dsService.GetByName(OrDataset);
                    DatasetDto numbers = dsService.GetByName(NumbersDataset);
                    DatasetDto validationNumbers = dsService.GetByName(ValidationNumbersDataset);
                    DatasetDto letters = dsService.GetByName(LettersDataset);
                    if (xor != null)
                    {
                        dsService.Delete(xor.Id, xor.UserId);
                    }
                    if (dice != null)
                    {
                        dsService.Delete(dice.Id, dice.UserId);
                    }
                    if (or != null)
                    {
                        dsService.Delete(or.Id, or.UserId);
                    }
                    if (numbers != null)
                    {
                        dsService.Delete(numbers.Id, numbers.UserId);
                    }
                    if (validationNumbers != null)
                    {
                        dsService.Delete(validationNumbers.Id, validationNumbers.UserId);
                    }
                    if (letters != null)
                    {
                        dsService.Delete(letters.Id, letters.UserId);
                    }
                }

                foreach (UserDto user in GetInitialUsers())
                {
                    try
                    {
                        userService.Create(user);
                    }
                    catch { };
                }
                dbContext.SaveChanges();

                foreach (DatasetDto dsDto in GetInitalDatasets(dbContext.Users.First().Id))
                {
                    try
                    {
                        dsService.Update(dsDto, dbContext.Users.First().Id);
                    }
                    catch(Exception ex)
                    {

                    };
                }

            }
        }


        /// <summary>
        /// Configures the HTTP/ HTTPS request pipeline depending on the setting in the appsettings.json file
        /// </summary>
        /// <param name="app">ApplicationBuilder</param>
        /// <param name="env">HostingEnviroment</param>
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseAuthentication();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            } 
            /*else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }*/
            
             if (Configuration.GetValue<bool>("UseHttpsRedirection"))
            {
                app.UseRewriter(new RewriteOptions().AddRedirectToHttps());
                app.UseHttpsRedirection();
            }
            
            app.UseStaticFiles(new StaticFileOptions
            {
                ServeUnknownFileTypes = Configuration.GetValue<bool>("ServeUnknownFileTypes"),
                DefaultContentType = "text/plain"
            });
            
            app.UseMiddleware(typeof(ErrorHandlingMiddleware));
            app.UseMvc();
        }

        /// <summary>
        /// Gets the list of the inital users
        /// </summary>
        /// <returns>Inital Users</returns>
        private List<UserDto> GetInitialUsers()
        {
            List<UserDto> users = new List<UserDto>();
            users.Add(new UserDto()
            {
                Email = Configuration.GetValue<string>("InitialUserEmail"),
                Password = Configuration.GetValue<string>("InitialUserPassword"),
            });

            return users;
        }

        /// <summary>
        /// Gets the list of the inital datasets
        /// </summary>
        /// <param name="userId">userid which creates the dataset</param>
        /// <returns>list of datasets</returns>
        private List<DatasetDto> GetInitalDatasets(int userId)
        {
            List<DatasetDto> datasets = new List<DatasetDto>();
            string location = System.Reflection.Assembly.GetEntryAssembly().Location;
            string directory = System.IO.Path.GetDirectoryName(location);
            DatasetDto xorDataset = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/xor.json"), 
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = XorDataset
            };
            DatasetDto diceDataset = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/dice.json"), 
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = DiceDataset
            };
            DatasetDto orDataset = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/or.json"), 
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = OrDataset
            };
            DatasetDto numbersDataset = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/numbers.json"),
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = NumbersDataset
            };

            DatasetDto letters = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/letters.json"), 
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = LettersDataset
            };

            DatasetDto numbersValidation = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/numbers_validation.json"), 
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = ValidationNumbersDataset
            };

            DatasetDto lettersValidation = new DatasetDto()
            {
                Json = File.ReadAllText($"{directory}/letters_validation.json"),
                Flags = DataSetFlags.Public,
                UserId = userId,
                Name = ValidationLettersDataset
            };

            datasets.Add(xorDataset);
            datasets.Add(diceDataset);
            datasets.Add(orDataset);
            datasets.Add(numbersDataset);
            datasets.Add(letters);
            datasets.Add(numbersValidation);
            datasets.Add(lettersValidation);

            return datasets;
        }

    }
}
