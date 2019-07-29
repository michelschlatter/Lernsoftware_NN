/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */


using Application.Dtos;
using Application.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Infrastructure.Repositories
{
    public class DatasetRepository : BaseRepository<Dataset>, IDatasetRepository
    {
        public DatasetRepository(DataContext dbContext) : base(dbContext) { }

        /// <summary>
        /// Gets all visible Datasets for the user
        /// </summary>
        /// <param name="userId">Nullable UserId</param>
        /// <returns>returns all vsibile datasets to the user</returns>
        public List<Dataset> GetAllVisible(int? userId)
        {
            IQueryable<Dataset> query = null;
            if (userId.HasValue)
            {
               query = DbContext.Datasets.Where(x => x.Flags.HasFlag(DataSetFlags.Public) ||
                    (x.UserId == userId && x.Flags.HasFlag(DataSetFlags.Private)));
            }
            else
            {
                query = DbContext.Datasets.Where(x => x.Flags.HasFlag(DataSetFlags.Public));
            }
                                            
             return query.ToList();
        }

        /// <summary>
        /// Gets a dataset by name
        /// </summary>
        /// <param name="name">dataset name</param>
        /// <returns>dataset</returns>
        public Dataset GetByName(string name)
        {
            return DbContext.Datasets.FirstOrDefault(x => x.Name.ToLower() == name.ToLower());
        }

        /// <summary>
        /// Gets all editable datasets for the user
        /// </summary>
        /// <param name="userId">userid</param>
        /// <returns>list of datasets</returns>
        public List<Dataset> GetAllEditable(int userId)
        {
            return DbContext.Datasets.Where(x => x.UserId == userId).ToList();
        }
    }
}
