# Command: Fix Issue

## 📥 Input
- A description of the bug or a stack trace.

## 🛠 Execution Steps
1. **Reproduce:** Create a test case that fails because of the bug.
2. **Analyze:** Use the `debugger.md` agent's strategy to find the root cause.
3. **Fix:** Apply the surgical code change.
4. **Validate:** Run the new test case and existing test suite.
5. **Review:** Use `code-reviewer.md` to ensure the fix doesn't introduce regressions.

## 🏁 Output
- Summary of the fix and confirmation of passing tests.
