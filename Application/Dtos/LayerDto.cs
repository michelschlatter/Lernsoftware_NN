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
    public class LayerDto
    {
        public int Neurons { get; set; }
        public string Activation { get; set; }
        public bool Bias { get; set; }

        public bool HasBias {
            get
            {
                return Bias;
            }
        }
    }
}
