﻿/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IDbContext : IDisposable
    {
        void Commit();
    }
}
