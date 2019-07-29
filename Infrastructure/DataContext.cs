/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure
{
    public class DataContext : DbContext, IDbContext
    {
        private readonly string connectionString;

        /// <summary>
        /// Datacontext Contructor, connection string
        /// </summary>
        /// <param name="conString"></param>
        public DataContext(string conString) : base()
        {
            connectionString = conString;
        }

        /// <summary>
        /// Datacontext Construcotr
        /// </summary>
        /// <param name="options">Db Options</param>
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        /// <summary>
        /// Saves the changes to the Database
        /// </summary>
        public void Commit()
        {
            SaveChanges();
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Dataset> Datasets { get; set; }


        /// <summary>
        /// Database configuration 
        /// </summary>
        /// <param name="optionsBuilder"></param>
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!string.IsNullOrEmpty(connectionString))
            {
                optionsBuilder.UseSqlServer(connectionString);
            }
        }

        /// <summary>
        /// Model creating settings
        /// </summary>
        /// <param name="builder">Model Builder</param>
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
            });
            builder.Entity<Dataset>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                .WithMany(e => e.Datasets)
                .HasForeignKey(e => e.UserId);
            });
          

        }
    }
}
