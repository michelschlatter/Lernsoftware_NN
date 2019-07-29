/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Dtos;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Infrastructure.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {

        public UserRepository(DataContext dbContext) : base(dbContext) { }

        /// <summary>
        /// Finds a user by email
        /// </summary>
        /// <param name="email">Email</param>
        /// <returns>Users</returns>
        public User FindByEmail(string email)
        {
           return DbContext.Users.FirstOrDefault(x => x.Email.ToLower().Trim() == email.ToLower().Trim());
        }
    }
}
