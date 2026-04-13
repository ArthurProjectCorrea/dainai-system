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
    }
}
