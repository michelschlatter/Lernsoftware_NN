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
    public enum DataSetFlags
    {
        Private = 1,
        Public = 2,
    }

    public class Dataset : BaseEntity
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Data { get; set; }
        public DataSetFlags Flags { get; set; }
        public DateTime Created { get; set; }
        public DateTime Modified { get; set; }

        public User User { get; set; }
    }
}
