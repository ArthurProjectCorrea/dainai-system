using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Team : BaseEntity<Guid>
    {
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; } = true;

        public virtual ICollection<ProfileTeam> ProfileTeams { get; set; } = new List<ProfileTeam>();
    }
}
