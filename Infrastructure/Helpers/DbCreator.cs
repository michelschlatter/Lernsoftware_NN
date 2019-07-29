/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Helpers
{
    public static class DbCreator
    {

        /// <summary>
        /// Creates the db if not exists, in debug mode sets up a new database
        /// </summary>
        /// <param name="dbContext"></param>
        public static void CreateDbIfNotExist(DataContext dbContext, bool isDevelopmentMode)
        {
            if (isDevelopmentMode)
            {
                dbContext.Database.EnsureDeleted();
            }
            dbContext.Database.EnsureCreated();
        }

      
    }
}
