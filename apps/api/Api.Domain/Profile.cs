using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Profile : BaseEntity<Guid>
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual ICollection<ProfileTeam> ProfileTeams { get; set; } = new List<ProfileTeam>();
    }
}
