"""Local answer-generation providers for the ARES document assistant.

Retrieval remains in :mod:`rag`; this module only turns already-selected,
already-retrieved evidence into a local model request.  It intentionally uses
the Python standard library so a working ARES installation does not gain a
second network or model dependency.
"""
from __future__ import annotations

from dataclasses import dataclass
import json
import os
import socket
from urllib import error, parse, request


class LlmError(ValueError):
    """Safe, actionable error that may be returned to an ARES operator."""


@dataclass(frozen=True)
class LlmConfig:
    provider: str
    enabled: bool
    ollama_base_url: str
    ollama_model: str
    timeout_seconds: int
    context_chars: int
    max_output_tokens: int

    @classmethod
    def from_environment(cls) -> "LlmConfig":
        def integer(name: str, default: int, low: int, high: int) -> int:
            try:
                return max(low, min(high, int(os.getenv(name, default))))
            except ValueError:
                return default

        return cls(
            provider=os.getenv("ARES_LLM_PROVIDER", "ollama").strip().lower(),
            enabled=os.getenv("ARES_LLM_ENABLED", "true").strip().lower() in {"1", "true", "yes", "on"},
            ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").strip().rstrip("/"),
            ollama_model=os.getenv("OLLAMA_MODEL", "llama3.2:3b").strip(),
            timeout_seconds=integer("OLLAMA_TIMEOUT_SECONDS", 120, 5, 600),
            context_chars=integer("ARES_LLM_CONTEXT_CHARS", 24000, 1000, 120000),
            max_output_tokens=integer("ARES_LLM_MAX_OUTPUT_TOKENS", 700, 64, 4096),
        )


def _ollama_url(config: LlmConfig, route: str) -> str:
    parsed = parse.urlparse(config.ollama_base_url)
    # ARES deliberately supports only a local Ollama daemon.  Do not let a
    # configuration typo turn document evidence into a remote request.
    if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "localhost", "::1"}:
        raise LlmError("OLLAMA_BASE_URL must point to the local Ollama server (http://127.0.0.1:11434).")
    if not config.ollama_model:
        raise LlmError("OLLAMA_MODEL is empty. Set it to an installed local model, for example llama3.2:3b.")
    return f"{config.ollama_base_url}{route}"


def _request_json(url: str, payload: dict | None, timeout: int, model: str = "") -> dict:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST" if body else "GET")
    try:
        with request.urlopen(req, timeout=timeout) as response:
            decoded = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        if exc.code == 404:
            raise LlmError("Ollama could not find the configured model. Run: ollama pull " + (model or "llama3.2:3b")) from exc
        raise LlmError(f"Ollama request failed (HTTP {exc.code}). Check that the local service is running.") from exc
    except error.URLError as exc:
        raise LlmError("Ollama is unavailable. Start it with `ollama serve` and verify http://127.0.0.1:11434.") from exc
    except (TimeoutError, socket.timeout) as exc:
        raise LlmError("Ollama timed out. Try a smaller model, a shorter question, or increase OLLAMA_TIMEOUT_SECONDS.") from exc
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise LlmError("Ollama returned an invalid response. Check the local Ollama server log.") from exc
    if not isinstance(decoded, dict):
        raise LlmError("Ollama returned an invalid response. Check the local Ollama server log.")
    return decoded


def generate_ollama_answer(messages: list[dict], config: LlmConfig) -> str:
    """Generate one non-streaming answer from trusted application messages."""
    if not config.enabled:
        raise LlmError("Local answer generation is disabled (set ARES_LLM_ENABLED=true to enable it).")
    if config.provider != "ollama":
        raise LlmError("Ollama is not the configured answer-generation provider.")
    response = _request_json(
        _ollama_url(config, "/api/chat"),
        {
            "model": config.ollama_model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": 0, "num_predict": config.max_output_tokens},
        },
        config.timeout_seconds,
        config.ollama_model,
    )
    message = response.get("message")
    answer = message.get("content", "").strip() if isinstance(message, dict) else ""
    if not answer:
        raise LlmError("Ollama returned an empty answer. Confirm the configured model with `ollama list` and try again.")
    return answer


def ollama_health(config: LlmConfig) -> dict:
    """Fast reachability/model check; it never asks the model to generate."""
    result = {"provider": config.provider, "enabled": config.enabled, "endpointReachable": False, "modelAvailable": False}
    if config.provider != "ollama" or not config.enabled:
        result["message"] = "Local Ollama generation is disabled or another provider is selected."
        return result
    try:
        payload = _request_json(_ollama_url(config, "/api/tags"), None, min(config.timeout_seconds, 5))
        result["endpointReachable"] = True
        names = {item.get("name") for item in payload.get("models", []) if isinstance(item, dict)}
        result["modelAvailable"] = config.ollama_model in names
        result["message"] = "Ollama is ready." if result["modelAvailable"] else f"Model {config.ollama_model} is not installed. Run: ollama pull {config.ollama_model}"
    except LlmError as exc:
        result["message"] = str(exc)
    return result
