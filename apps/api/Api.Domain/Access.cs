using System;

namespace Api.Domain
{
    public class Access : BaseEntity<int>
    {
        public int PositionId { get; set; }
        public virtual Position Position { get; set; } = null!;

        public int ScreenId { get; set; }
        public virtual Screen Screen { get; set; } = null!;

        public int PermissionId { get; set; }
        public virtual Permission Permission { get; set; } = null!;

        /// <summary>
        /// The Data-Level scope filter applied to this permission (all, team, user).
        /// Defaults to team.
        /// </summary>
        public string? Scope { get; set; }
    }
}
