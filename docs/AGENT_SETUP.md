# ElevenLabs Agent Setup Guide

This guide walks you through creating and configuring your ElevenLabs Conversational AI agent for CodeBud.

## Prerequisites

- An ElevenLabs account (sign up at [elevenlabs.io](https://elevenlabs.io))
- At least a Starter plan for Conversational AI access

---

## Step 1: Create a New Agent

1. Go to [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Click **"Create Agent"** or **"New Agent"**
3. Select **"Blank Agent"** to start from scratch

---

## Step 2: Configure Basic Settings

In the agent settings panel:

| Setting            | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| **Name**           | CodeBud                                                                |
| **Language Model** | Claude 3.5 Sonnet (recommended)                                        |
| **Voice**          | Choose a clear, professional voice (e.g., "Adam", "Antoni", or "Josh") |
| **Stability**      | 0.5 (balanced)                                                         |
| **Clarity**        | 0.75 (slightly enhanced)                                               |

---

## Step 3: Set the First Message

Paste this as your agent's first message:

```
Hey! I'm CodeBud, your AI pair programming assistant. I can see your code and help you write, debug, and improve it. Right now I'm in navigator mode, so I'll observe and give advice. Say "switch to driver mode" if you want me to actually write code for you. What are you working on?
```

---

## Step 4: Set the System Prompt

Paste this complete system prompt:

```
You are CodeBud, an expert AI pair programmer embedded in VS Code. You help developers write, debug, and improve their code through natural voice conversation.

## Modes

You operate in two modes:

**NAVIGATOR MODE** (default):
- You observe and advise
- You explain concepts, suggest approaches, identify bugs
- You CANNOT modify code directly
- If the user asks you to write code, remind them to switch to driver mode

**DRIVER MODE**:
- You can insert code into the editor using the insert_code_line tool
- Always explain what you're going to add before adding it
- Insert code line by line for complex additions
- Confirm with the user before making changes

## Tools Available

You have access to these tools to interact with VS Code:

1. **get_code_context**: See the current file, cursor position, selection, and recent changes
2. **get_diagnostics**: See errors and warnings in the current file
3. **insert_code_line**: Insert code at a specific line (driver mode only)
4. **switch_mode**: Switch between driver and navigator modes

## Personality

- Be conversational but concise - you're voice-first
- Use natural speech, not formal documentation style
- Show enthusiasm for clever solutions
- Be honest about limitations
- Keep responses under 3 sentences when possible

## Behavior Rules

1. ALWAYS check the code context at the start of a conversation or when the user mentions their code
2. Check diagnostics when the user mentions errors or bugs
3. In navigator mode, NEVER use insert_code_line - explain what should be changed instead
4. Before inserting code in driver mode, briefly describe what you'll add
5. When the user says "switch to driver/navigator mode", use the switch_mode tool
6. If a tool fails, explain the error simply and suggest a fix

## Example Interactions

User: "I have a bug somewhere"
You: *use get_diagnostics* "I can see there's an error on line 5 - you're calling a function that doesn't exist. Did you mean to import it?"

User: "Add a function to calculate the average"
Navigator mode: "Sure! You'll want to add a function that takes an array, sums the values, and divides by length. Want me to switch to driver mode to write it?"
Driver mode: *use insert_code_line* "I'll add an average function at line 12..."

User: "What does this code do?"
You: *use get_code_context* "This is a sorting function using the quicksort algorithm. It picks a pivot, partitions the array, then recursively sorts each side."
```

---

## Step 5: Register Client Tools

Add these 4 client tools. For each tool, enable **"Wait for response"**.

### Tool 1: get_code_context

| Field                 | Value                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `get_code_context`                                                                                                                                                  |
| **Description**       | Get the current code context from VS Code including file content, cursor position, selected text, and recent changes. Call this to see what the user is working on. |
| **Parameters**        | None                                                                                                                                                                |
| **Wait for response** | ✅ Enabled                                                                                                                                                           |

### Tool 2: get_diagnostics

| Field                 | Value                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `get_diagnostics`                                                                                                                         |
| **Description**       | Get errors, warnings and other diagnostics from VS Code for the current file. Call this when the user mentions bugs, errors, or problems. |
| **Parameters**        | None                                                                                                                                      |
| **Wait for response** | ✅ Enabled                                                                                                                                 |

### Tool 3: insert_code_line

| Field                 | Value                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `insert_code_line`                                                                                                                    |
| **Description**       | Insert a line of code at a specific line number in the active editor. Only works in driver mode. Use this to write code for the user. |
| **Parameters**        | See below                                                                                                                             |
| **Wait for response** | ✅ Enabled                                                                                                                             |

**Parameters for insert_code_line:**

```json
{
  "type": "object",
  "properties": {
    "line": {
      "type": "number",
      "description": "The line number where code should be inserted (1-indexed)"
    },
    "code": {
      "type": "string",
      "description": "The code to insert"
    }
  },
  "required": ["line", "code"]
}
```

### Tool 4: switch_mode

| Field                 | Value                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `switch_mode`                                                                                                              |
| **Description**       | Switch between driver and navigator modes. In navigator mode, you observe and advise. In driver mode, you can modify code. |
| **Parameters**        | See below                                                                                                                  |
| **Wait for response** | ✅ Enabled                                                                                                                  |

**Parameters for switch_mode:**

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": "string",
      "description": "The mode to switch to: 'driver' or 'navigator'"
    }
  },
  "required": ["mode"]
}
```

---

## Step 6: Test in Playground

1. Click the **"Playground"** or **"Test"** button
2. Start a conversation
3. Try saying: "What code am I looking at?"
4. The agent should attempt to call `get_code_context` (it will fail without the extension, but you should see the tool call)

---

## Step 7: Copy Your Agent ID

1. Go to your agent's settings
2. Find the **Agent ID** (a long string like `abc123def456...`)
3. Copy it
4. Open `voice-ui/src/config.ts`
5. Replace `YOUR_AGENT_ID_HERE` with your agent ID:

```typescript
export const AGENT_ID = 'your-actual-agent-id-here';
```

---

## Troubleshooting

### "Tool call failed"
- Make sure the VS Code extension is running
- Check that you have a file open in VS Code
- Look at the browser console for specific error messages

### Voice not connecting
- Check your browser has microphone permissions
- Make sure you're on `http://localhost:5173` (not HTTPS)
- Try a different browser (Chrome works best)

### Agent says wrong things
- Review and update the system prompt
- Add more specific examples
- Adjust voice stability if it sounds unnatural

### Rate limits
- ElevenLabs has usage limits based on your plan
- Monitor your usage in the dashboard
- Consider upgrading if you hit limits during development

---

## Next Steps

1. Test the full flow: Extension → Voice UI → Agent → Extension
2. Iterate on the system prompt based on real conversations
3. Customize the voice and personality to your preference
4. Add more context to tool descriptions if the agent misuses them
