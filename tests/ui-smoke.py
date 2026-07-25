import os
from pathlib import Path

from playwright.sync_api import Locator, Page, sync_playwright


base_url = os.getenv("BASE_URL", "http://127.0.0.1:3100")
artifact_dir = os.getenv("ARTIFACT_DIR")
output = Path(artifact_dir) if artifact_dir else None


def assert_no_horizontal_overflow(page: Page) -> None:
    metrics = page.evaluate(
        """() => ({
            viewport: window.innerWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
        })"""
    )
    assert metrics["document"] <= metrics["viewport"], metrics
    assert metrics["body"] <= metrics["viewport"], metrics


def assert_touch_target(locator: Locator) -> None:
    box = locator.bounding_box()
    assert box, "control has no bounding box"
    assert box["width"] >= 44 and box["height"] >= 44, box


def assert_within(locator: Locator, container: Locator) -> None:
    box = locator.bounding_box()
    bounds = container.bounding_box()
    assert box and bounds, "control or container has no bounding box"
    assert box["x"] + box["width"] <= bounds["x"] + bounds["width"] + 1, (box, bounds)


TEXT_OVERFLOW_SCRIPT = """(scope) => {
    const clipBounds = (el) => {
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return {
            left: box.left + parseFloat(style.borderLeftWidth),
            right: box.right - parseFloat(style.borderRightWidth),
        };
    };
    const clippingAncestors = (el) => {
        const found = [];
        for (let node = el.parentElement; node; node = node.parentElement) {
            const overflow = getComputedStyle(node).overflowX;
            if (overflow === 'hidden' || overflow === 'clip') found.push(node);
        }
        return found;
    };
    const inkEdges = (el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0);
        if (!rects.length) return null;
        return {
            left: Math.min(...rects.map((rect) => rect.left)),
            right: Math.max(...rects.map((rect) => rect.right)),
        };
    };

    const offenders = [];
    for (const el of document.querySelectorAll(scope)) {
        const holdsText = Array.from(el.childNodes)
            .some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (!holdsText) continue;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const ink = inkEdges(el);
        if (!ink) continue;
        for (const ancestor of clippingAncestors(el)) {
            const bounds = clipBounds(ancestor);
            const hidden = Math.max(ink.right - bounds.right, bounds.left - ink.left);
            if (hidden > 1) {
                offenders.push({
                    text: el.textContent.trim().slice(0, 40),
                    clippedBy: ancestor.className || ancestor.tagName,
                    hiddenBy: Math.round(hidden),
                });
            }
        }
    }
    return offenders;
}"""


def assert_no_trimmed_text(page: Page) -> None:
    """No text may be sliced off by an ancestor's hidden overflow."""
    scope = ('.generator-workbench, .generator-workbench *, '
             '.archive-section, .archive-section *')
    trimmed = page.evaluate(TEXT_OVERFLOW_SCRIPT, scope)
    assert not trimmed, trimmed


def assert_phrase_inside_panel(page: Page) -> None:
    """Long tokens such as "cryptographically-agilize" must wrap, never be sliced off."""
    trimmed = page.evaluate(TEXT_OVERFLOW_SCRIPT, '[data-testid="generated-phrase"]')
    assert not trimmed, trimmed


def assert_phrase_uses_panel(page: Page, minimum_ratio: float) -> None:
    """Guards the regression where a ch-based cap left most of the panel empty."""
    ratio = page.evaluate(
        """() => {
            const phrase = document.querySelector('[data-testid="generated-phrase"]');
            const panel = document.querySelector('.brief-panel');
            const style = getComputedStyle(panel);
            const usable = panel.clientWidth
                - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            return phrase.getBoundingClientRect().width / usable;
        }"""
    )
    assert ratio >= minimum_ratio, f"phrase only spans {ratio:.0%} of the panel"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, channel="chrome")
    context = browser.new_context(
        viewport={"width": 320, "height": 720},
        reduced_motion="reduce",
        permissions=["clipboard-read", "clipboard-write"],
    )
    page = context.new_page()
    page_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))

    # The profile summary and the generated output both label the voice, so
    # locators for either have to be scoped to one of them.
    profile_summary = page.locator(".generation-profile-current")
    output_meta = page.locator(".output-meta")

    response = page.goto(base_url, wait_until="networkidle")
    assert response and response.ok, response.status if response else "No response"
    page.get_by_role("heading", name="Make nothing sound strategic.").wait_for()
    page.get_by_role("heading", name="Archived briefs").wait_for()
    page.get_by_text("Nothing archived.", exact=True).wait_for()
    profile_summary.get_by_text("VOICE / RANDOM", exact=True).wait_for()
    profile_summary.get_by_text("SCOPE / ALL STACKS", exact=True).wait_for()
    assert page.get_by_role("region", name="Tune generation").count() == 0
    assert_no_horizontal_overflow(page)
    assert_no_trimmed_text(page)
    assert_phrase_inside_panel(page)

    for label in ["Tune", "Generate jargon", "Copy memo", "Save brief"]:
        assert_touch_target(page.get_by_role("button", name=label))

    page.get_by_role("button", name="Tune").click()
    profile = page.get_by_role("region", name="Tune generation")
    profile.wait_for()
    page.get_by_role("button", name="ENGINEERING", exact=True).click()
    page.get_by_role("button", name="CYBERSECURITY", exact=True).click()
    page.get_by_role("button", name="Apply & generate").click()
    assert profile.count() == 0
    output_meta.get_by_text("VOICE / ENGINEERING", exact=True).wait_for()
    output_meta.get_by_text("STACK / CYBERSECURITY", exact=True).wait_for()
    assert_no_horizontal_overflow(page)

    if output:
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=output / "generator-tuned-320.png", full_page=True)

    # text_content() keeps the stored capitalisation; inner_text() would return the
    # uppercased rendering, which matches neither the saved card nor its aria-label.
    phrase = page.get_by_test_id("generated-phrase").text_content().strip().strip("“”\"")
    page.get_by_role("button", name="Save brief").click()
    page.get_by_text("01 / 20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    # A populated collection must keep its controls reachable and unclipped.
    for label in [f"Copy {phrase}", f"Remove {phrase} from saved briefs", "Copy all", "Clear all"]:
        assert_touch_target(page.get_by_role("button", name=label))
    assert_within(page.get_by_role("button", name="Clear all"), page.locator(".archive-section"))
    assert_no_trimmed_text(page)
    assert_no_horizontal_overflow(page)

    page.reload(wait_until="networkidle")
    profile_summary.get_by_text("VOICE / ENGINEERING", exact=True).wait_for()
    profile_summary.get_by_text("SCOPE / CYBERSECURITY", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.get_by_role("button", name="Tune").click()
    page.keyboard.press("Escape")
    assert page.get_by_role("region", name="Tune generation").count() == 0

    page.get_by_role("button", name="Tune").click()
    page.get_by_role("button", name="Reset to random").click()
    profile_summary.get_by_text("VOICE / RANDOM", exact=True).wait_for()
    profile_summary.get_by_text("SCOPE / ALL STACKS", exact=True).wait_for()

    page.set_viewport_size({"width": 1440, "height": 1000})
    page.get_by_role("button", name="Tune").click()
    page.get_by_role("region", name="Tune generation").wait_for()
    assert_no_horizontal_overflow(page)
    if output:
        page.screenshot(path=output / "generator-profile-desktop.png", full_page=True)

    # Post-quantum supplies the longest tokens the generator can build, so it is
    # the field most likely to spill out of the panel.
    page.get_by_role("button", name="QUANTUM & POST-QUANTUM", exact=True).click()
    page.get_by_role("button", name="Apply & generate").click()
    output_meta.get_by_text("STACK / QUANTUM & POST-QUANTUM", exact=True).wait_for()

    for width in [320, 390, 768, 1440]:
        page.set_viewport_size({"width": width, "height": 1000})
        for _ in range(12):
            page.get_by_role("button", name="Generate jargon").click()
            page.wait_for_timeout(50)
            assert_phrase_inside_panel(page)
            assert_no_trimmed_text(page)
            assert_no_horizontal_overflow(page)

    page.set_viewport_size({"width": 1440, "height": 1000})
    page.wait_for_timeout(50)
    assert_phrase_uses_panel(page, 0.85)
    if output:
        page.screenshot(path=output / "generator-long-tokens-desktop.png", full_page=True)

    assert not page_errors, page_errors
    context.close()
    browser.close()
