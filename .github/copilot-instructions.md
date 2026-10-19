# Requisito: Project Context

## What Requisito is
Requisito is a "paperwork pathfinder". It tells a person exactly which government or institutional documents they need for a goal, in what order to get them, and keeps track of the documents they already have, including when those expire.

It is NOT a to-do list, task manager, or note-taking app. Users do not invent their own tasks. The app tells them what is required.

## The problem
Getting a passport, NBI clearance, a first job, a driver's license, or SSS/PhilHealth means chasing documents that depend on other documents (PSA birth certificate, valid ID, barangay clearance, TIN, and so on). Requirements differ by situation, and people get turned away after hours in line for missing one paper.

## Core concepts (use this vocabulary)
- **Goal**: something the user wants to accomplish (e.g. "Renew passport", "Apply for first job"). The user picks from predefined goals. They do not type free-form tasks.
- **Requirement**: a document needed for a goal. Requirements have an order because some depend on others.
- **Checklist**: the ordered list of requirements for a selected goal. Requirements are marked done as the user obtains them.
- **Document**: a paper the user already holds. Documents can expire, so the app warns the user before they do.
- **Reuse**: one document can satisfy requirements across several goals.

## Main user flow
1. User picks a goal.
2. User answers a few situational questions (for example, married? born abroad?).
3. App generates an ordered requirements checklist.
4. User works through it and the app tracks progress and document expiry.

## Pages (React Router)
- `/` Home: dashboard with summary cards giving an overview
- `/goals` Goals: choose a goal (predefined options)
- `/checklist` Checklist: the ordered requirements for the chosen goal

## Tech and conventions
React + Vite, JavaScript (.jsx), react-router-dom, plain CSS, npm. Functional components only. Shared Layout (header, nav, main with Outlet, footer). No backend, database, auth, or extra dependencies. This is a school prototype, so keep it small and readable.

## Rules
- Never turn Requisito features into generic to-do functionality (add task, delete task, edit task, "mark as complete" on free text).
- Never prefill form inputs or auto-generate sample user records.
- Do not add features beyond the current GitHub issue.
- Do not touch Git (no branching, committing, pushing, merging). The developer does this.
- Do not modify unrelated files or dependencies.