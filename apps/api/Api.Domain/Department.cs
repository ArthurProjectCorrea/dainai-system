using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Department : BaseEntity<int>
    {
        public string Name { get; set; } = null!;
        public virtual ICollection<Position> Positions { get; set; } = new List<Position>();
    }
}
