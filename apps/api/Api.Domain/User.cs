using Microsoft.AspNetCore.Identity;
using System;

namespace Api.Domain
{
    public class User : IdentityUser<Guid>
    {
        public virtual Profile Profile { get; set; } = null!;
    }
}
