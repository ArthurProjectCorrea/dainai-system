using System;

namespace Api.Domain
{
    public class ProfileTeam : BaseEntity<int>
    {
        public Guid ProfileId { get; set; }
        public virtual Profile Profile { get; set; } = null!;

        public Guid TeamId { get; set; }
        public virtual Team Team { get; set; } = null!;

        public int PositionId { get; set; }
        public virtual Position Position { get; set; } = null!;
    }
}
