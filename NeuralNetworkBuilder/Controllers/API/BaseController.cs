/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure;
using Infrastructure.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace NeuralNetworkBuilder.Controllers.API
{
    public abstract class BaseController : ControllerBase
    {
        protected readonly DataContext DbContext;

        /// <summary>
        /// Constructur: Initializes the DbContext
        /// </summary>
        public BaseController()
        {
            DbContext = DataContextFactory.GetDataContext(Startup.ConnectionString);
        }

        /// <summary>
        /// Returns the current logged user id or if not logged in returns null
        /// </summary>
        public int? UserId
        {
            get
            {
                if(int.TryParse(HttpContext.User.Identity.Name, out int userId))
                {
                    return userId;
                }
                else
                {
                    return null;
                }
            }
        }
    }
}
