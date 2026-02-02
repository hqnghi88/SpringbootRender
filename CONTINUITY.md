# Continuity Ledger

## Goal
Merge gama.parent pom.xml into the Spring Boot project to create a unified multi-module Maven build.

## Constraints/Assumptions
- GAMA modules use Eclipse Tycho for OSGi bundle building
- Spring Boot uses standard Maven
- Need to support building both together or separately

## Key decisions
- Created root pom.xml at `/Users/hqnghi/git/SpringbootRender/pom.xml`
- Added profiles: `springboot-only`, `gama-only` for selective builds
- Default build includes all modules

## State

### Done
- Created merged root pom.xml with all GAMA and Spring Boot modules
- Preserved all Tycho configuration for GAMA modules
- Added Spring Boot as a module

### Now
- Complete

### Next
- User can build with:
  - `mvn clean install` - build everything
  - `mvn clean install -P springboot-only` - build only Spring Boot
  - `mvn clean install -P gama-only` - build only GAMA

## Open questions
- None

## Working set
- `/Users/hqnghi/git/SpringbootRender/pom.xml` (root)
- `/Users/hqnghi/git/SpringbootRender/springboot/pom.xml`
- `/Users/hqnghi/git/SpringbootRender/gama.parent/pom.xml`
