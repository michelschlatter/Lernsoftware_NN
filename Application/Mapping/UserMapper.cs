/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Dtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Mapping
{
    public static class UserMapper
    {
        /// <summary>
        /// Maps the User to a UserDto
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="mapWithPassword">true: maps with password</param>
        /// <returns>UserDto</returns>
        public static UserDto ToDto(User user, bool mapWithPassword)
        {
            if (user != null)
            {
                UserDto userDto = new UserDto()
                {
                    Email = user.Email,
                    Id = user.Id,
                    Password = mapWithPassword ? user.Password : null
                };
                return userDto;
            }
            return null;
        }
    }
}
