using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Permission : BaseEntity<int>
    {
        public string Name { get; set; } = null!;
        public string NameKey { get; set; } = null!;

        public virtual ICollection<Access> Accesses { get; set; } = new List<Access>();
    }
}
