# Architecture Documentation Update Rules

## Templates for Different Types of Changes

### 1. New API Endpoints

```markdown
### API Endpoints

| Endpoint   | Method | Description | Authentication | Caching |
| ---------- | ------ | ----------- | -------------- | ------- |
| `/api/new` | POST   | Description | Yes/No         | Time    |
```

### 2. New Components

```markdown
#### Widgets Layer (`/client/src/components/`)

- **Files**:
  - `NewComponent.tsx` - Purpose description
```

### 3. Caching Changes

```markdown
#### Next.js Server-Side Caching

- **New function**: Description with code example
- **Settings**: Specific parameters
```

### 4. Security Changes

````markdown
#### Cookie Settings

```typescript
// New settings
{
	// code
}
```
````

### 5. New Dependencies

```markdown
### Dependencies

- **New library**: Version and purpose
- **Updates**: What changed
```

## Mandatory Sections for Updates

### For any changes update:

1. **"Recent Changes"** - brief description
2. **Relevant section** - detailed description
3. **Code examples** - if implementation changed
4. **Tables** - if API or components changed

### When adding new files:

1. Specify file path
2. Describe purpose
3. Specify type (server/client component)
4. Add to relevant FSD layer

### When changing configuration:

1. Specify what changed
2. Show before/after
3. Explain reason for change
4. Add to "Recent Changes" section
