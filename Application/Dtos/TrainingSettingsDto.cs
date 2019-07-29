/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Dtos
{
    public class TrainingSettingsDto
    {
        public string Optimizer { get; set; }
        public string Loss { get; set; }
        public double LearningRate { get; set; }
        public double? Momentum { get; set; }
        public double MinError { get; set; }
        public int MaxIterations { get; set; }
    }
}
