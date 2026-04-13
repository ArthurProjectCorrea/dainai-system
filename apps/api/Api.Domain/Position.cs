using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Position : BaseEntity<int>
    {
        public string Name { get; set; } = null!;
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; } = null!;
        public bool IsActive { get; set; } = true;

        public virtual ICollection<Access> Accesses { get; set; } = new List<Access>();
        public virtual ICollection<ProfileTeam> ProfileTeams { get; set; } = new List<ProfileTeam>();
    }
}
