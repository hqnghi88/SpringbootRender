# Continuity Ledger

## Goal
Add dual-view frontend with GAML Modeling editor and Simulation viewer for GAMA platform integration.

## Constraints/Assumptions
- Frontend is React-based (react-scripts)
- Current App.js has SIR simulation viewer
- Need Monaco Editor for GAML syntax highlighting
- Need React Router for view navigation

## Key decisions
- Use Monaco Editor with custom GAML language definition
- Tab-based navigation between Modeling and Simulation
- Pass GAML code via React context between views

## State

### Done
- Analyzed existing frontend structure
- Created implementation plan for dual-view

### Now
- Awaiting user approval of implementation plan

### Next
- Install dependencies (react-router-dom, @monaco-editor/react)
- Create component structure
- Implement GAML syntax highlighting
- Refactor App.js with routing

## Open questions
- None

## Working set
- `/Users/hqnghi/git/SpringbootRender/frontend/package.json`
- `/Users/hqnghi/git/SpringbootRender/frontend/src/App.js`
