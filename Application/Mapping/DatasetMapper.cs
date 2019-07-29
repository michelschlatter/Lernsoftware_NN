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
    public static class DatasetMapper
    {
        /// <summary>
        /// Maps a Dataset to a DatasetDto
        /// </summary>
        /// <param name="ds">Dataset</param>
        /// <returns>DatasetDto</returns>
        public static DatasetDto ToDto(Dataset ds)
        {
            if (ds != null)
            {
                DatasetDto dto = new DatasetDto();
                dto.Name = ds.Name;
                dto.Flags = ds.Flags;
                dto.Id = ds.Id;
                dto.Json = ds.Data;
                dto.UserId = ds.UserId;
                dto.User = ds.User;
                return dto;
            }
            return null;
        }
    }
}
