/*
 * Author: Michel Schlatter
 * Date: 28.07.2019
 * Version: 1.0
 */

using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    [Flags]
    public enum NeuralNetworkFlags
    {

    }

    public class NeuralNetwork : BaseEntity
    {
        public int UserId { get; set; }
        public string Data { get; set; }
        public NeuralNetworkFlags Flags { get; set; }

        public User User { get; set; }
    }

}
