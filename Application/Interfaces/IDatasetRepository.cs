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

namespace Application.Interfaces
{
    public interface IDatasetRepository : IRepository<Dataset>
    {
         List<Dataset> GetAllVisible(int? userId);
         List<Dataset> GetAllEditable(int userId);
         Dataset GetByName(string name);

    }
}
