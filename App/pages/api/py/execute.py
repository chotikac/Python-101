# Vercel detects Python runtime by file extension inside /api
# This runs curated Python code and returns stdout/stderr.
# SECURITY: Do NOT expose this as an open eval for the internet in production.

import io, sys, json, traceback
from typing import Any, Dict

# Preload heavy libs once per cold start:
try:
    import numpy as np
    import pandas as pd
    from sklearn.linear_model import LinearRegression
    PRELOADED = True
except Exception:
    PRELOADED = False

def run_user_code(src: str) -> str:
    # Minimal sandbox: limit builtins; allow numpy/pandas/sklearn already imported
    # For a class, prefer whitelisting tasks, not raw code execution.
    user_globals = {
        "__builtins__": {
            "print": print, "range": range, "len": len, "sum": sum, "min": min, "max": max,
            "float": float, "int": int, "str": str, "list": list, "dict": dict, "set": set,
            # add safe builtins as needed
        },
        # expose preloaded packages
        "np": sys.modules.get("numpy"),
        "pd": sys.modules.get("pandas"),
        "LinearRegression": sys.modules.get("sklearn.linear_model").LinearRegression if "sklearn.linear_model" in sys.modules else None
    }
    stdout = io.StringIO()
    stderr = io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout, stderr
    try:
        exec(src, user_globals, None)
    except Exception:
        traceback.print_exc()
    finally:
        sys.stdout, sys.stderr = old_out, old_err
    return (stdout.getvalue() + stderr.getvalue())

def handler(request) -> Dict[str, Any]:
    if request.method != "POST":
        return {"statusCode": 405, "headers": {"Content-Type":"application/json"},
                "body": json.dumps({"error": "Use POST"})}

    try:
        body = request.get_json()
        code = body.get("code","")
        output = run_user_code(code)
        return {"statusCode": 200, "headers": {"Content-Type":"application/json"},
                "body": json.dumps({"ok": True, "preloaded": PRELOADED, "output": output})}
    except Exception as e:
        return {"statusCode": 500, "headers": {"Content-Type":"application/json"},
                "body": json.dumps({"error": str(e)})}

# Vercel Python entrypoint
def main(request):
    resp = handler(request)
    from werkzeug.wrappers import Response
    return Response(response=resp["body"], status=resp["statusCode"], headers=resp["headers"])