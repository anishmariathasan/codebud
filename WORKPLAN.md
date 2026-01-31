# CodeBud Workplan

## Team Assignments

### Person 1 (P1) - VS Code Extension
**Focus**: Backend extension development

| File                             | Status |
| -------------------------------- | ------ |
| `extension/src/extension.ts`     | Owner  |
| `extension/src/codeWatcher.ts`   | Owner  |
| `extension/src/diagnostics.ts`   | Owner  |
| `extension/src/modeManager.ts`   | Owner  |
| `extension/src/commands.ts`      | Owner  |
| `extension/src/editorActions.ts` | Owner  |
| `extension/package.json`         | Owner  |
| `extension/tsconfig.json`        | Owner  |
| `extension/.vscode/*`            | Owner  |
| `shared/types.ts`                | Owner  |
| `scripts/test-api.sh`            | Owner  |

### Person 2 (P2) - Voice UI
**Focus**: React frontend development

| File                          | Status |
| ----------------------------- | ------ |
| `voice-ui/src/App.tsx`        | Owner  |
| `voice-ui/src/api.ts`         | Owner  |
| `voice-ui/src/mockApi.ts`     | Owner  |
| `voice-ui/src/clientTools.ts` | Owner  |
| `voice-ui/src/components/*`   | Owner  |
| `voice-ui/src/hooks/*`        | Owner  |
| `voice-ui/src/config.ts`      | Owner  |
| `voice-ui/package.json`       | Owner  |
| `voice-ui/vite.config.ts`     | Owner  |

### Person 3 (P3) - AI Agent & Integration
**Focus**: ElevenLabs configuration and testing

| File                                | Status  |
| ----------------------------------- | ------- |
| `docs/AGENT_SETUP.md`               | Owner   |
| ElevenLabs Agent Configuration      | Owner   |
| Integration Testing                 | Owner   |
| `voice-ui/src/config.ts` (AGENT_ID) | Fill in |

---

## Hour-by-Hour Plan

### Hour 0-1: Setup & Parallel Development

| Person | Tasks                                                                |
| ------ | -------------------------------------------------------------------- |
| P1     | Run `npm run setup`, test F5 launch, verify Express server starts    |
| P2     | Run `npm run ui`, verify mock API works, review component structure  |
| P3     | Create ElevenLabs account, read AGENT_SETUP.md, start agent creation |

### Hour 1-2: Core Implementation

| Person | Tasks                                                     |
| ------ | --------------------------------------------------------- |
| P1     | Test all API endpoints with `test-api.sh`, fix any issues |
| P2     | Set `USE_MOCK = false`, test with real extension          |
| P3     | Configure system prompt, add all 4 client tools           |

### Hour 2-3: Integration

| Person | Tasks                                                |
| ------ | ---------------------------------------------------- |
| P1     | Add any missing endpoints P2/P3 discover they need   |
| P2     | Fine-tune UI based on real voice responses           |
| P3     | Test agent in playground, copy Agent ID to config.ts |

### Hour 3-4: Polish & Demo Prep

| Person | Tasks                       |
| ------ | --------------------------- |
| All    | End-to-end testing together |
| All    | Bug fixes and polish        |
| All    | Prepare demo script         |

---

## Integration Checkpoints

### Checkpoint 1 (End of Hour 1)
- [ ] Extension runs without errors
- [ ] Voice UI loads with mock data
- [ ] Agent exists in ElevenLabs

### Checkpoint 2 (End of Hour 2)
- [ ] Voice UI connects to real extension
- [ ] Agent has all client tools configured
- [ ] Mode toggle works end-to-end

### Checkpoint 3 (End of Hour 3)
- [ ] Full voice conversation works
- [ ] Code insertion works in driver mode
- [ ] Diagnostics are read by agent

---

## Communication

- Slack/Discord for quick questions
- Call out blockers immediately
- P3 shares Agent ID as soon as it's created

## Dependencies

```
P1 must complete → P2 can test real API
P3 must complete → Full integration testing
```

Both P1 and P2 can start immediately in parallel thanks to mock API.
