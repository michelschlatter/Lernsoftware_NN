/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using Domain.Entities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Application.Dtos
{
    public class DatasetDto : BaseDto
    {
        private DatasetEnvelopeDto datasetEnvelope;

        public int UserId { get; set; }

        public string Name { get; set; }

        public string Json { get; set; }

        public DataSetFlags Flags { get; set; }
        public User User { get; set; }

        public DatasetEnvelopeDto Dataset
        {
            get
            {
                if (datasetEnvelope == null && !string.IsNullOrEmpty(Json))
                {
                    datasetEnvelope = JsonConvert.DeserializeObject<DatasetEnvelopeDto>(Json);
                }
                return datasetEnvelope;
            }
        }
      
    }

  
}
