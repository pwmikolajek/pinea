# Pinea V2 - Documentation Index

This document serves as a central navigation hub for all project documentation.

## Quick Links

### Core Documentation
- **[README.md](./README.md)** - Main project overview, setup instructions, and feature list
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** - Version history and release notes

### Deployment & Operations
- **[docs/REDEPLOY_NOTES.md](./docs/REDEPLOY_NOTES.md)** - Deployment instructions and operational notes

### Application-Specific Documentation

#### Sparrow (PDF Commenting Tool)
- **[docs/SPARROW_INTEGRATION.md](./docs/SPARROW_INTEGRATION.md)** - Integration guide for Sparrow
- **[docs/sparrow-version-control.md](./docs/sparrow-version-control.md)** - PDF version control implementation details

## Documentation by Topic

### Getting Started
1. Start with [README.md](./README.md) for project overview
2. Review [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the system structure
3. Follow deployment guide in [docs/REDEPLOY_NOTES.md](./docs/REDEPLOY_NOTES.md) if deploying

### Working with Sparrow
1. Integration: [docs/SPARROW_INTEGRATION.md](./docs/SPARROW_INTEGRATION.md)
2. Version Control: [docs/sparrow-version-control.md](./docs/sparrow-version-control.md)

### Development Workflow
1. Setup: [README.md](./README.md#installation) - Installation and environment setup
2. Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Understand the codebase structure
3. Changes: [docs/CHANGELOG.md](./docs/CHANGELOG.md) - Track project evolution

## Documentation Organization

```
Pinea V2/
├── README.md                           # Main project documentation
├── NOTES.md                            # This file - documentation index
│
└── docs/                               # All detailed documentation
    ├── ARCHITECTURE.md                 # System architecture
    ├── CHANGELOG.md                    # Version history
    ├── REDEPLOY_NOTES.md               # Deployment guide
    ├── SPARROW_INTEGRATION.md          # Sparrow integration guide
    └── sparrow-version-control.md      # PDF version control implementation
```

## Recent Updates

### November 14, 2025
- **Version Control System**: Implemented complete PDF version control for Sparrow
  - See: [docs/sparrow-version-control.md](./docs/sparrow-version-control.md)
  - Projects can now have multiple PDF versions
  - Version selector in viewer
  - Upload workflow supports creating new projects or adding versions

- **Color Scheme Update**: Changed Sparrow from bright greens to natural earth tones
  - Primary: `#6C6A63` (warm gray-brown)
  - Hover: `#3C3A33` (darker warm brown)
  - Background: `#E8E6DE` (light beige)

- **Local Development Mode**: Enhanced local dev mode for Sparrow
  - Mock data services for offline development
  - In-memory PDF caching to avoid localStorage quota
  - Email/password authentication in dev mode

## Contributing Documentation

When adding new documentation:

1. **For major features**: Create a new file in `docs/` directory
   - Use descriptive filename (e.g., `feature-name-implementation.md`)
   - Include: Overview, Architecture, Implementation, Testing, Future Enhancements

2. **For minor updates**: Update existing documentation files
   - README.md for user-facing changes
   - ARCHITECTURE.md for structural changes
   - CHANGELOG.md for all changes

3. **Update this index**: Add links to new documentation in the appropriate section above

## Document Templates

### Feature Documentation Template
```markdown
# Feature Name

**Date:** YYYY-MM-DD
**Status:** [Planned/In Progress/Implemented/Deprecated]

## Overview
Brief description of the feature and its purpose.

## Architecture
Technical design and data structures.

## Implementation Details
Code changes, files modified, key functions.

## Features
User-facing functionality.

## Testing Instructions
How to test the feature.

## Future Enhancements
Planned improvements.

## Related Files
Links to related documentation.
```

## Need Help?

- **Getting Started**: See [README.md](./README.md)
- **Technical Questions**: Check [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Deployment Issues**: Review [docs/REDEPLOY_NOTES.md](./docs/REDEPLOY_NOTES.md)
- **Sparrow-Specific**: See [docs/SPARROW_INTEGRATION.md](./docs/SPARROW_INTEGRATION.md) or [docs/sparrow-version-control.md](./docs/sparrow-version-control.md)
