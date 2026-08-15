# Maritime Decision Network — solution_logic.py
# Replaced by optimizer.py for maritime supply chain optimization.
# This file re-exports the main entry point for backward compatibility.

from .optimizer import run_full_optimization

def process_solution(input_data: dict) -> dict:
    """
    Backward-compatible entry point.
    Expects input_data to contain a 'scenario' key or to be the scenario itself.
    """
    scenario = input_data.get("scenario", input_data)
    weights = input_data.get("weights")
    return run_full_optimization(scenario, weights)
