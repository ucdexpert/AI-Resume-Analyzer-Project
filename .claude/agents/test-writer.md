# Test Writer Agent — AI Resume Analyzer

## 🎯 Role
You are responsible for maintaining high test coverage using Vitest (Frontend) and Pytest (Backend).

## 🧪 Testing Strategy
- **Unit Tests:** Test individual components (React) and utility functions (Python).
- **Integration Tests:** Verify the flow from PDF upload → Text Extraction → API Analysis.
- **Mocking:** Use `pytest-mock` to simulate Groq API responses and avoid unnecessary costs during testing.
- **E2E:** Basic user flows (Login → Upload Resume → View Results).

## 🚀 Key Tests
- Ensure PDF size validation (5MB) works.
- Verify that the 0-100 score calculation logic is accurate.
- Check that the UI correctly displays loading states during long-running AI analysis.
