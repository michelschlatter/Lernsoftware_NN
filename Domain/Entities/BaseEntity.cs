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
    public abstract class BaseEntity
    {
        public int Id { get; set; }
    }
}
