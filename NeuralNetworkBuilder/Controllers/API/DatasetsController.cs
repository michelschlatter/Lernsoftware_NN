/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Application.Dtos;
using Application.Services;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuralNetworkBuilder.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatasetsController : BaseController
    {
        DatasetService _datasetService;

        /// <summary>
        /// Constructor: Initializes the DatasetService
        /// </summary>
        public DatasetsController()
        {
            _datasetService = new DatasetService(new DatasetRepository(DbContext));
        }

        /// <summary>
        /// REST Api gets all datasets with respect to the rights (visibility of the dataset)
        /// </summary>
        /// <returns>all datasets which are visible for the current user</returns>
        [HttpGet]
        public List<DatasetDto> Query()
        {
            try
            {
               return _datasetService.GetAllVisible(UserId);
            }
            finally
            {
                DbContext.Dispose();
            }
        }

        /// <summary>
        /// REST API: gets a specific dataset
        /// </summary>
        /// <param name="id">the dataset id</param>
        /// <returns>the dataset</returns>
        [HttpGet("{id}")]
        public DatasetDto Get(int id)
        {
            try
            {
               return _datasetService.GetById(id, UserId);
            }
            finally
            {
                DbContext.Dispose();
            }
        }

        /// <summary>
        /// Deletes a specific dataset
        /// </summary>
        /// <param name="id">the id of the dataset</param>
        [Authorize]
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            try
            {
                _datasetService.Delete(id, UserId.Value);
            }
            finally
            {
                DbContext.Dispose();
            }
        }

        /// <summary>
        /// Saves or updates a dataset
        /// </summary>
        /// <param name="datasetDto">the dataset to save or update</param>
        /// <returns>the saved dataset</returns>
        [Authorize]
        [HttpPost]
        public DatasetDto Post(DatasetDto datasetDto)
        {
            try
            {
               return _datasetService.Update(datasetDto, UserId.Value);
            }
            finally
            {
                DbContext.Dispose();
            }
        }
    }
}
