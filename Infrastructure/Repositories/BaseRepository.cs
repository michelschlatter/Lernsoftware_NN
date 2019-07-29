/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Infrastructure.Repositories
{
    public class BaseRepository<TEntity> : IRepository<TEntity> where TEntity : BaseEntity
    {
        protected readonly DataContext DbContext;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbContext">DbContext</param>
        public BaseRepository(DataContext dbContext)
        {
            DbContext = dbContext;
        }

        /// <summary>
        /// Gets an entity by id
        /// </summary>
        /// <param name="id">id</param>
        /// <returns>Entity</returns>
        public TEntity GetById(int id)
        {
            return DbContext.Set<TEntity>().SingleOrDefault(e => e.Id == id);
        }

        /// <summary>
        /// Adds an entity 
        /// </summary>
        /// <param name="entity">Entity</param>
        public void Add(TEntity entity)
        {
            DbContext.Set<TEntity>().Add(entity);
        }

        /// <summary>
        /// Deletes an entity
        /// </summary>
        /// <param name="entity">Entity</param>
        public void Delete(TEntity entity)
        {
            DbContext.Set<TEntity>().Remove(entity);
        }

        public IDbContext DataContext { get { return DbContext;  } }
    }
}
