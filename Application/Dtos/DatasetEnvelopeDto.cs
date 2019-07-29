/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Application.Dtos
{
    public class DatasetEnvelopeDto
    {
        public string Description { get; set; }
        public bool IsValidationset { get; set; }

        public DataItemDto[] Items { get; set; }

        public string[] OutputDescription { get; set; }

        public List<double[]> Data
        {
            get
            {
                return Items?.Select(x => x.Data).ToList();
            }
        }

        public List<double[]> Labels
        {
            get
            {
                return Items?.Select(x => x.Labels).ToList();
            }
        }

        public int[] Matrix { get; set; }

        public LayerDto[] Layers { get; set; }

        public TrainingSettingsDto TrainingSettings { get; set; }

        public string ProblemType { get; set; } // classification, regression

        public bool HasMatrix
        {
            get
            {
                return Matrix != null && Matrix.Length == 2;
            }
        }

        public bool HasPredefinedArchitecture
        {
            get
            {
                return Layers != null && Layers.Length > 0;
            }
        }

        public bool HasPredefinedTrainingSettings
        {
            get
            {
                return TrainingSettings != null;
            }
        }

        public int InputNeurons
        {
            get
            {
                return Items?.FirstOrDefault()?.Data?.Length ?? 0;
            }
        }

        public int OutputNeurons
        {
            get
            {
                return Items?.FirstOrDefault()?.Labels?.Length ?? 0;
            }
        }

        public float StepSize { get; set; }
    }
}
