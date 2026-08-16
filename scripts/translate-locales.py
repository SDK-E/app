#!/usr/bin/env python3
import argparse
import json
import re
import sys
import time
import urllib.request
import urllib.parse

SOURCE_FILE = "src/locales/en.json"
STATE_FILE = "src/locales/.translation-state.json"
SUPPORTED_LOCALES = ("fr", "de", "es", "pt", "it", "nl", "sv", "no", "da", "fi", "pl", "cs", "hu", "ro", "bg", "el")

PRESERVE_MAP = {
    "SIREN": "__PRESERVE_SIREN__",
    "SIRET": "__PRESERVE_SIRET__",
    "RCS Paris": "__PRESERVE_RCS_PARIS__",
    "GDPR": "__PRESERVE_GDPR__",
    "RGPD": "__PRESERVE_RGPD__",
    "CNIL": "__PRESERVE_CNIL__",
    "SDK Enterprises": "__PRESERVE_SDK_ENTERPRISES__",
    "Vercel": "__PRESERVE_VERCEL__",
    "Auth0 (Okta)": "__PRESERVE_AUTH0__",
    "Resend": "__PRESERVE_RESEND__",
    "Prisma Postgres": "__PRESERVE_PRISMA_POSTGRES__",
    "LCEN": "__PRESERVE_LCEN__",
    "Art. 6(1)(b)": "__PRESERVE_ART_6_1_B__",
    "Art. 6(1)(f)": "__PRESERVE_ART_6_1_F__",
    "Art. 6(1)(c)": "__PRESERVE_ART_6_1_C__",
    "Art. 30 GDPR": "__PRESERVE_ART_30_GDPR__",
    "Articles 15 to 22 GDPR": "__PRESERVE_ARTICLES_15_22__",
    "www.cnil.fr": "__PRESERVE_CNIL_URL__",
    "SDK": "__PRESERVE_SDK__",
}

TECHNICAL_TERMS = (
    "LLM", "RAG", "PHP", "Laravel", "Symfony", "Java", "Spring Boot",
    "Node.js", "API", "APIs", "React", "Vue", "Nuxt", "TypeScript",
    "Tailwind", "Shadcn", "AWS", "GCP", "Azure", "Kubernetes", "Helm",
    "CI/CD", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Valkey",
    "Elasticsearch", "B2B", "SaaS", "JetBrains Mono", "Vercel Analytics",
    "Chrome", "Firefox", "Safari", "Edge",
)

SPLIT_MARKER = "__SDK_TRANSLATION_SPLIT_8F4C2A__"

def protect(text: str) -> str:
    # next-intl interpolation variables must survive translation byte-for-byte.
    text = re.sub(r"\{([^{}]+)\}", lambda match: f"ZXQV{match.group(1).upper()}QXZ", text)
    for index, (original, _) in enumerate(sorted(PRESERVE_MAP.items(), key=lambda x: -len(x[0]))):
        text = text.replace(original, f"ZXQP{index}QXZ")
    for index, term in enumerate(sorted(TECHNICAL_TERMS, key=len, reverse=True)):
        text = text.replace(term, f"ZXQT{index}QXZ")
    return text

def unprotect(text: str) -> str:
    for index, term in enumerate(sorted(TECHNICAL_TERMS, key=len, reverse=True)):
        text = text.replace(f"ZXQT{index}QXZ", term)
    for index, (original, _) in enumerate(sorted(PRESERVE_MAP.items(), key=lambda x: -len(x[0]))):
        text = text.replace(f"ZXQP{index}QXZ", original)
    text = re.sub(r"ZXQV([A-Z0-9_]+)QXZ", lambda match: "{" + match.group(1).lower() + "}", text)
    if "ZXQ" in text or "QXZ" in text:
        raise RuntimeError(f"unresolved preservation marker in: {text}")
    return text

def translate_batch(texts, target_lang):
    joined = f"\n{SPLIT_MARKER}\n".join(texts)
    params = urllib.parse.urlencode({
        "client": "gtx",
        "sl": "en",
        "tl": target_lang,
        "dt": "t",
        "q": joined,
    })
    url = f"https://translate.googleapis.com/translate_a/single?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    translated = "".join(item[0] for item in data[0] if item[0])
    parts = re.split(rf"\s*{re.escape(SPLIT_MARKER)}\s*", translated)
    if len(parts) != len(texts):
        raise RuntimeError(f"translation batch split mismatch: expected {len(texts)}, got {len(parts)}")
    return parts

def collect_strings(obj, key_path="root"):
    strings = []
    if isinstance(obj, str):
        strings.append((key_path, obj))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            strings.extend(collect_strings(item, f"{key_path}[{i}]"))
    elif isinstance(obj, dict):
        for k, v in obj.items():
            strings.extend(collect_strings(v, f"{key_path}.{k}"))
    return strings

def flatten_strings(value, key_path="root", result=None):
    result = {} if result is None else result
    if isinstance(value, str):
        result[key_path] = value
    elif isinstance(value, list):
        for index, item in enumerate(value):
            flatten_strings(item, f"{key_path}[{index}]", result)
    elif isinstance(value, dict):
        for key, item in value.items():
            flatten_strings(item, f"{key_path}.{key}", result)
    return result


def validate(source, target, locale, allow_missing=False):
    errors = []

    def walk(source_value, target_value, key_path):
        if isinstance(source_value, str):
            if not isinstance(target_value, str):
                errors.append(f"{key_path}: expected string")
                return
            source_tokens = sorted(re.findall(r"\{[^{}]+\}", source_value))
            target_tokens = sorted(re.findall(r"\{[^{}]+\}", target_value))
            if source_tokens != target_tokens:
                errors.append(f"{key_path}: interpolation variables changed")
            if re.search(r"ZXQ|QXZ|__PRESERVE|\[TRANSLATE", target_value):
                errors.append(f"{key_path}: unresolved translation marker")
        elif isinstance(source_value, list):
            if not isinstance(target_value, list) or len(source_value) != len(target_value):
                errors.append(f"{key_path}: array shape differs from English")
                return
            for index, item in enumerate(source_value):
                walk(item, target_value[index], f"{key_path}[{index}]")
        elif isinstance(source_value, dict):
            if not isinstance(target_value, dict):
                if allow_missing:
                    return
                errors.append(f"{key_path}: expected object")
                return
            if not allow_missing and list(source_value) != list(target_value):
                errors.append(f"{key_path}: object keys differ from English")
                return
            for key, item in source_value.items():
                if key not in target_value:
                    if allow_missing:
                        continue
                    errors.append(f"{key_path}: missing key {key}")
                    continue
                walk(item, target_value[key], f"{key_path}.{key}")

    walk(source, target, "root")
    if errors:
        raise RuntimeError(f"{locale} validation failed:\n  " + "\n  ".join(errors))


def main():
    parser = argparse.ArgumentParser(description="Incrementally translate and validate next-intl catalogs.")
    parser.add_argument("locales", nargs="*", metavar="LOCALE")
    parser.add_argument("--all", action="store_true", help="Retranslate every string instead of only changed English strings.")
    parser.add_argument("--check", action="store_true", help="Validate catalogs without network access or writes.")
    parser.add_argument("--record", action="store_true", help="Record the current validated catalogs as the incremental baseline.")
    args = parser.parse_args()
    locales = args.locales or list(SUPPORTED_LOCALES)
    unsupported = sorted(set(locales) - set(SUPPORTED_LOCALES))
    if unsupported:
        parser.error(f"unsupported locale(s): {', '.join(unsupported)}")

    with open(SOURCE_FILE, "r", encoding="utf-8") as source_file:
        source = json.load(source_file)
    source_strings = flatten_strings(source)
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as state_file:
            state = json.load(state_file)
    except FileNotFoundError:
        state = {}

    for locale in locales:
        output_file = f"src/locales/{locale}.json"
        with open(output_file, "r", encoding="utf-8") as target_file:
            existing = json.load(target_file)
        validate(source, existing, locale, allow_missing=True)
        if args.check:
            print(f"{locale}: OK")
            continue
        if args.record:
            state[locale] = source_strings
            print(f"{locale}: baseline recorded")
            continue

        previous = state.get(locale, {})
        changed_paths = set(source_strings) if args.all else {
            key_path for key_path, text in source_strings.items() if previous.get(key_path) != text
        }
        translatable = [
            (key_path, text) for key_path, text in source_strings.items()
            if key_path in changed_paths
        ]
        if not translatable:
            print(f"{locale}: already current")
            state[locale] = source_strings
            continue

        print(f"{locale}: translating {len(translatable)} changed strings")
        unique_texts = list(dict.fromkeys(text for _, text in translatable))
        cache = {}
        for offset in range(0, len(unique_texts), 10):
            batch = unique_texts[offset:offset + 10]
            last_error = None
            for attempt in range(3):
                try:
                    translated = translate_batch([protect(text) for text in batch], locale)
                    cache.update({original: unprotect(result) for original, result in zip(batch, translated)})
                    last_error = None
                    break
                except Exception as error:
                    last_error = error
                    time.sleep(0.5 * (attempt + 1))
            if last_error is not None:
                raise RuntimeError(f"{locale}: translation failed at batch {offset}: {last_error}")
            time.sleep(0.05)

        def rebuild(source_value, existing_value, key_path):
            if isinstance(source_value, str):
                if key_path in changed_paths or not isinstance(existing_value, str):
                    return cache[source_value]
                return existing_value
            if isinstance(source_value, list):
                old = existing_value if isinstance(existing_value, list) else []
                return [rebuild(item, old[index] if index < len(old) else None, f"{key_path}[{index}]") for index, item in enumerate(source_value)]
            if isinstance(source_value, dict):
                old = existing_value if isinstance(existing_value, dict) else {}
                result = {}
                for key, item in source_value.items():
                    if key in old:
                        result[key] = rebuild(item, old[key], f"{key_path}.{key}")
                    else:
                        result[key] = rebuild(item, None, f"{key_path}.{key}")
                return result
            return source_value

        target = rebuild(source, existing, "root")
        validate(source, target, locale)
        with open(output_file, "w", encoding="utf-8") as target_file:
            json.dump(target, target_file, ensure_ascii=False, indent=2)
            target_file.write("\n")
        state[locale] = source_strings
        print(f"{locale}: updated")

    if not args.check:
        with open(STATE_FILE, "w", encoding="utf-8") as state_file:
            json.dump(state, state_file, ensure_ascii=False, indent=2)
            state_file.write("\n")


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, json.JSONDecodeError) as error:
        print(error, file=sys.stderr)
        sys.exit(1)
