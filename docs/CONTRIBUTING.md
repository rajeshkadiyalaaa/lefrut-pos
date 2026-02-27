# Contributing to Le Frut POS

Thank you for your interest in contributing to Le Frut POS!

---

## Project Status

This is a **proprietary project** created for Le Frut business operations. External contributions are not currently accepted.

---

## For Internal Development Team

### Development Workflow

1. **Branch Strategy**
   ```bash
   main          # Production-ready code
   develop       # Development branch
   feature/*     # New features
   bugfix/*      # Bug fixes
   hotfix/*      # Urgent production fixes
   ```

2. **Creating a Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

3. **Making Changes**
   - Write clean, readable code
   - Follow TypeScript best practices
   - Add comments for complex logic
   - Update documentation if needed

4. **Testing**
   ```bash
   # Run linter
   npm run lint
   
   # Build to check for errors
   npm run build
   
   # Test in dev mode
   npm run dev
   
   # Test Electron build
   npm run package-win
   ```

5. **Committing Changes**
   ```bash
   git add .
   git commit -m "feat: add product search filter"
   ```

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

6. **Pushing and Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create Pull Request to `develop` branch
   - Request review from team
   - Address review comments
   - Merge after approval

---

## Code Standards

### TypeScript

```typescript
// ✅ Good - Explicit types
interface Product {
  id: string;
  name: string;
  price: number;
}

const getProduct = (id: string): Product | null => {
  // ...
};

// ❌ Bad - Implicit any
const getProduct = (id) => {
  // ...
};
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div onClick={() => onClick(product.id)}>
      {product.name}
    </div>
  );
};

// ❌ Bad - No types
export const ProductCard = ({ product, onClick }) => {
  // ...
};
```

### Naming Conventions

- **Components**: PascalCase (`ProductCard.tsx`)
- **Files**: camelCase (`useAuth.ts`)
- **Functions**: camelCase (`getProducts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase (`Product`, `CartItem`)

### File Organization

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── types/              # TypeScript type definitions
└── App.tsx             # Root component
```

### Comments

```typescript
// ✅ Good - Explain why, not what
// Debounce search to prevent excessive API calls
const debouncedSearch = debounce(handleSearch, 300);

// ❌ Bad - Obvious comment
// Set the name variable to product name
const name = product.name;
```

---

## Adding New Features

### 1. Plan the Feature

- Discuss with team
- Document requirements
- Design database schema if needed
- Plan UI/UX

### 2. Database Changes

```sql
-- Create migration file: supabase/migrations/YYYYMMDD_feature_name.sql
ALTER TABLE products ADD COLUMN new_field TEXT;

-- Add RLS policy if needed
CREATE POLICY "policy_name" ON table_name FOR operation
USING (auth.uid() = user_id);
```

### 3. Update Types

```typescript
// src/types/index.ts
export interface Product {
  // ... existing fields
  new_field?: string; // Add new field
}
```

### 4. Update Database Functions

```typescript
// src/lib/supabase.ts
export const updateNewField = async (id: string, value: string) => {
  const { data, error } = await supabase
    .from('products')
    .update({ new_field: value })
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};
```

### 5. Update UI Components

```typescript
// src/components/YourComponent.tsx
// Add UI for new feature
```

### 6. Test Thoroughly

- Test all CRUD operations
- Test edge cases
- Test error handling
- Test in dev and production builds
- Test Electron app

### 7. Update Documentation

- Update README if needed
- Update FEATURES_GUIDE.md
- Update API_REFERENCE.md
- Add to CHANGELOG.md

---

## Bug Fixes

### 1. Reproduce the Bug

- Create detailed steps to reproduce
- Note error messages
- Check browser console
- Check Supabase logs

### 2. Identify the Cause

- Use debugger
- Add console logs
- Review related code
- Check recent changes

### 3. Fix the Bug

- Write the fix
- Test thoroughly
- Add regression test if possible

### 4. Document

- Update CHANGELOG.md
- Add comments if fix is complex

---

## Performance Optimization

### Best Practices

1. **Use React.memo for expensive components**
   ```typescript
   export const ProductCard = React.memo<ProductCardProps>(({ product }) => {
     // ...
   });
   ```

2. **Debounce user input**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((query: string) => {
       // Search logic
     }, 300),
     []
   );
   ```

3. **Virtualize long lists**
   ```typescript
   import { FixedSizeGrid } from 'react-window';
   ```

4. **Optimize database queries**
   ```typescript
   // Select only needed columns
   .select('id, name, price')
   
   // Use indexes
   .eq('user_id', userId) // user_id is indexed
   
   // Limit results
   .limit(100)
   ```

---

## Testing

### Manual Testing Checklist

Before submitting PR:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] No linter errors
- [ ] Responsive on different screen sizes
- [ ] Works in development (`npm run dev`)
- [ ] Builds successfully (`npm run build`)
- [ ] Electron app builds (`npm run package-win`)
- [ ] Electron app works correctly

### Test Scenarios

For major features, test:

1. **Happy Path**: Everything works correctly
2. **Edge Cases**: Empty states, maximum values, etc.
3. **Error Cases**: Network errors, validation errors
4. **User Errors**: Invalid input, missing required fields

---

## Documentation

### When to Update Docs

Update documentation when you:

- Add a new feature
- Change existing functionality
- Fix a notable bug
- Change API or database schema
- Update dependencies

### What to Update

- **README.md**: High-level changes, new features
- **FEATURES_GUIDE.md**: Detailed feature documentation
- **API_REFERENCE.md**: Database function changes
- **CHANGELOG.md**: All changes (required)
- **Code comments**: Complex logic

---

## Release Process

### Version Numbering

Follow Semantic Versioning (semver):
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features (backwards compatible)
- **Patch** (1.0.1): Bug fixes (backwards compatible)

### Release Checklist

1. [ ] All features tested
2. [ ] All bugs fixed
3. [ ] Documentation updated
4. [ ] CHANGELOG.md updated
5. [ ] Version bumped in package.json
6. [ ] Build successful (`npm run build`)
7. [ ] Electron app builds (`npm run package-win`)
8. [ ] Create git tag
9. [ ] Deploy to production

---

## Getting Help

### Internal Resources

- Check existing documentation
- Review code comments
- Ask team members
- Check git history for context

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Code of Conduct

- Be respectful and professional
- Write clean, maintainable code
- Test your changes thoroughly
- Document significant changes
- Review others' code constructively
- Keep sensitive information secure

---

## Questions?

Contact the development team lead for any questions about contributing.

---

**Last Updated**: February 2026
