using System;

namespace Api.Domain
{
    public class OtpAttempt : BaseEntity<int>
    {
        public string Email { get; set; } = null!;
        public int AttemptCount { get; set; }
        public DateTime LastAttempt { get; set; } = DateTime.UtcNow;
        public bool IsBlocked { get; set; }
    }
}
