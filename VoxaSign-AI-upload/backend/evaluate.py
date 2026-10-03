import json
import time
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TEST_FILE = PROJECT_ROOT / "data" / "test_cases.json"
API_URL = "http://127.0.0.1:8000/analyze"

with open(TEST_FILE, "r", encoding="utf-8") as file:
    test_cases = json.load(file)

correct = 0
latencies = []

for number, case in enumerate(test_cases, start=1):
    payload = {
        "message": case["message"],
        "situation": case["expected_situation"]
    }

    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        start_time = time.perf_counter()

        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode("utf-8"))

        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000
        latencies.append(latency_ms)

        predicted = result["situation"]
        expected = case["expected_situation"]
        is_correct = predicted == expected

        if is_correct:
            correct += 1

        status = "CORRECT" if is_correct else "WRONG"

        print(
            f"{number:02d}. {status} | "
            f"Expected: {expected:<15} | "
            f"Predicted: {predicted:<15} | "
            f"Time: {latency_ms:.0f} ms | "
            f"{case['message']}"
        )

    except Exception as error:
        print(f"{number:02d}. ERROR | {error}")

accuracy = correct / len(test_cases) * 100

print("\nEvaluation summary")
print("------------------")
print(f"Correct predictions: {correct}/{len(test_cases)}")
print(f"Context accuracy: {accuracy:.2f}%")

if latencies:
    average_latency = sum(latencies) / len(latencies)
    print(f"Average response time: {average_latency:.0f} ms")