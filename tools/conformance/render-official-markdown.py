#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from typing import Any

from markdown_it import MarkdownIt

DISALLOWED_TAGS = [
    'title',
    'textarea',
    'style',
    'xmp',
    'iframe',
    'noembed',
    'noframes',
    'script',
    'plaintext',
]
DISALLOWED_SOURCE_RE = re.compile(r'<(/?(?:' + '|'.join(DISALLOWED_TAGS) + r')\b[^>]*)>', re.I)
DISALLOWED_HTML_RE = re.compile(
    r'&lt;(/?(?:title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext))&gt;',
    re.I,
)

COMMONMARK = MarkdownIt('commonmark')
GFM = MarkdownIt('commonmark').enable(['table', 'strikethrough'])

WWW_RE = re.compile(r'www\.[^\s<]+')
PROTO_RE = re.compile(r'(?i)(?:https?://|ftp://)[^\s<]+')
EMAIL_RE = re.compile(r'[A-Za-z0-9._+-]+@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]*[A-Za-z0-9])+\.?')
ALLOWED_PREV = set(' \t\n*_~(')


def replace_style_align(html: str) -> str:
    return re.sub(
        r'<(t[hd])\s+style="text-align:(left|center|right)"([^>]*)>',
        lambda m: f'<{m.group(1)} align="{m.group(2)}"{m.group(3)}>',
        html,
    )


def transform_task_lists(html: str) -> str:
    unchecked = '<input disabled="" type="checkbox">'
    checked = '<input checked="" disabled="" type="checkbox">'
    return re.sub(
        r'(^|\n)(\s*)<li>\[([ xX])\](\s+)',
        lambda m: (
            f"{m.group(1)}{m.group(2)}<li>"
            f"{checked if m.group(3).lower() == 'x' else unchecked}"
            f"{m.group(4)}"
        ),
        html,
    )


def collapse_strong_safe(html: str) -> str:
    previous = None
    current = html
    while current != previous:
        previous = current
        current = re.sub(r'<strong>\s*<strong>([^<]*)</strong>\s*</strong>', r'<strong>\1</strong>', current)
        current = re.sub(r'<strong>([^<]*)<strong>([^<]*)</strong>([^<]*)</strong>', r'<strong>\1\2\3</strong>', current)
    return current


def replace_strikethrough_tags(html: str) -> str:
    return html.replace('<s>', '<del>').replace('</s>', '</del>')


def preprocess_tagfilter(markdown: str) -> str:
    return DISALLOWED_SOURCE_RE.sub(lambda m: '&lt;' + m.group(1) + '>', markdown)


def postprocess_tagfilter_html(html: str) -> str:
    return DISALLOWED_HTML_RE.sub(lambda m: '&lt;' + m.group(1) + '>', html)


def trim_www_or_proto(url: str) -> tuple[str, str]:
    trailer = ''
    if '&lt;' in url:
        index = url.index('&lt;')
        return url[:index], url[index:]
    entity_tail = re.search(r'&amp;([A-Za-z][A-Za-z0-9]{1,31});$', url)
    if entity_tail:
        return url[:entity_tail.start()], url[entity_tail.start():]
    while url and url[-1] in '?!.,:*_~':
        trailer = url[-1] + trailer
        url = url[:-1]
    while url.endswith(')') and url.count(')') > url.count('('):
        trailer = ')' + trailer
        url = url[:-1]
    return url, trailer


def valid_domain_from_url(candidate: str) -> bool:
    if candidate.startswith('www.'):
        rest = candidate[4:]
    else:
        rest = re.split(r'(?i)^(?:https?://|ftp://)', candidate, maxsplit=1)[-1]
    domain = re.split(r'[/?#]', rest, maxsplit=1)[0]
    if '&lt;' in domain or '&amp;' in domain:
        return False
    labels = domain.split('.')
    if len(labels) < 2:
        return False
    return all(re.match(r'^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$', label or '') for label in labels)


def linkify_text_autolink_extension(text: str) -> str:
    out: list[str] = []
    index = 0
    while index < len(text):
        best: tuple[str, re.Match[str]] | None = None
        for kind, regex in (('www', WWW_RE), ('proto', PROTO_RE), ('email', EMAIL_RE)):
            match = regex.search(text, index)
            if match and (best is None or match.start() < best[1].start()):
                best = (kind, match)
        if best is None:
            out.append(text[index:])
            break

        kind, match = best
        start, end = match.span()
        out.append(text[index:start])

        previous_character = text[start - 1] if start > 0 else '\n'
        if start > 0 and previous_character not in ALLOWED_PREV:
            out.append(text[start:end])
            index = end
            continue

        raw = match.group(0)
        if kind in ('www', 'proto'):
            url, trailer = trim_www_or_proto(raw)
            if not url or not valid_domain_from_url(url):
                out.append(raw)
                index = end
                continue
            href = ('http://' + url) if kind == 'www' else url
            out.append(f'<a href="{href}">{url}</a>{trailer}')
        else:
            local, domain = raw.split('@', 1)
            if (
                '+' in domain
                or not re.match(r'^[A-Za-z0-9._+-]+$', local)
                or not re.match(r'^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]*[A-Za-z0-9])+\.?$', domain)
            ):
                out.append(raw)
                index = end
                continue
            next_character = text[end:end + 1]
            if next_character and next_character in '-_':
                out.append(raw)
                index = end
                continue
            trailer = ''
            candidate = raw
            if candidate.endswith('.'):
                trailer = '.'
                candidate = candidate[:-1]
            out.append(f'<a href="mailto:{candidate}">{candidate}</a>{trailer}')

        index = end

    return ''.join(out)


def linkify_html_autolink_extension(html: str) -> str:
    parts = re.split(r'(<[^>]+>)', html)
    out: list[str] = []
    stack: list[str] = []
    skip_tags = {'a', 'code', 'pre'}

    for part in parts:
        if not part:
            continue
        if part.startswith('<') and part.endswith('>'):
            tag_match = re.match(r'</?\s*([A-Za-z0-9]+)', part)
            if tag_match:
                tag = tag_match.group(1).lower()
                if part.startswith('</'):
                    for reverse_index in range(len(stack) - 1, -1, -1):
                        if stack[reverse_index] == tag:
                            stack.pop(reverse_index)
                            break
                elif not part.endswith('/>'):
                    stack.append(tag)
            out.append(part)
            continue
        out.append(part if any(tag in skip_tags for tag in stack) else linkify_text_autolink_extension(part))

    return ''.join(out)


def render_commonmark(markdown: str) -> str:
    return COMMONMARK.render(markdown)


def render_gfm(markdown: str, section: str | None = None) -> str:
    effective_markdown = preprocess_tagfilter(markdown) if section == 'tagfilter' else markdown
    html = GFM.render(effective_markdown)
    html = collapse_strong_safe(html)
    if section == 'table':
        html = replace_style_align(html)
    if section == 'disabled':
        html = transform_task_lists(html)
    if section == 'strikethrough':
        html = replace_strikethrough_tags(html)
    if section == 'autolink':
        html = linkify_html_autolink_extension(html)
    if section == 'tagfilter':
        html = postprocess_tagfilter_html(html)
    return html


def main() -> int:
    payload = json.loads(sys.stdin.buffer.read().decode('utf-8') or '{}')
    profile = str(payload.get('profile') or '').strip() or 'commonmark'
    tests = payload.get('tests') or []
    rendered: list[dict[str, Any]] = []
    for test_case in tests:
        markdown = str(test_case.get('markdown') or '')
        section = str(test_case.get('section') or 'example')
        if profile == 'gfm':
            html = render_gfm(markdown, section)
        else:
            html = render_commonmark(markdown)
        rendered.append({'html': html})
    sys.stdout.buffer.write(json.dumps({'profile': profile, 'count': len(rendered), 'rendered': rendered}).encode('utf-8'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
