using System;
using System.Collections.Generic;

namespace Api.Domain
{
    public class Category : BaseEntity<int>
    {
        public string Name { get; set; } = null!;
        public ICollection<DocumentCategory> DocumentCategories { get; set; } = new List<DocumentCategory>();
    }
}
