/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Helpers
{
   public static class DataContextFactory
   {
        /// <summary>
        /// Gets the datacontext depending on the build configuration
        /// </summary>
        /// <returns>Datacontext</returns>
        public static DataContext GetDataContext(string connectionString)
        {
            return new DataContext(connectionString);
        }

        /// <summary>
        /// Gets the in memory database
        /// </summary>
        /// <param name="databaseName">the database name of the in memory db</param>
        /// <returns>in memory db context</returns>
        public static DbContextOptions<DataContext> GetInMemoryDb(string databaseName)
        {
            return new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: databaseName)
                .Options;
        }
    }
}
