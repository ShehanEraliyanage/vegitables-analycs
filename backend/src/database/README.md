# Database Migrations

This directory contains TypeORM migrations for managing database schema changes.

## Migration Files

- `1700000000000-InitialSchema.ts` - Initial schema with products and prices tables

## Running Migrations

### Run All Pending Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
npm run migration:show
```

### Generate New Migration

After modifying entities, generate a new migration:

```bash
npm run migration:generate -- -n MigrationName
```

### Create Empty Migration

Create an empty migration file for manual SQL:

```bash
npm run migration:create -- -n MigrationName
```

## Migration Workflow

1. **Modify Entities**: Update entity files in `src/common/entities/`
2. **Generate Migration**: Run `npm run migration:generate -- -n DescriptiveName`
3. **Review Migration**: Check the generated migration file
4. **Run Migration**: Execute `npm run migration:run`
5. **Test**: Verify the changes work correctly

## Important Notes

- Always review generated migrations before running them
- Never modify existing migrations that have already been run in production
- Create new migrations for schema changes
- Keep migrations small and focused on single changes
- Test migrations on a development database first

