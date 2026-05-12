import json

def safe_json_loads(val, default=None):
    """
    Robustly parse JSON, handling NULLs, non-string types, and double-encoding.
    """
    if val is None:
        return default
    if not isinstance(val, (str, bytes)):
        return val
    try:
        parsed = json.loads(val)
        # Handle double-encoded strings (e.g., '"[]"')
        if isinstance(parsed, str) and parsed != val:
            return safe_json_loads(parsed, default)
        return parsed
    except (json.JSONDecodeError, TypeError):
        return default
