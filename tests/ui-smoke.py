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

    response = page.goto(base_url, wait_until="networkidle")
    assert response and response.ok, response.status if response else "no response"
    page.get_by_role("heading", name="CORPO // BRAINDANCE").wait_for()
    page.get_by_role("heading", name="Saved Briefs").wait_for()
    page.get_by_text("No saved briefs yet.", exact=False).wait_for()
    assert page.get_by_text("Neural Dossier", exact=True).count() == 0
    assert page.locator(".cyber-grid").evaluate("element => getComputedStyle(element).animationName") == "none"
    assert_no_horizontal_overflow(page)

    for label in ["Visionary", "Growth", "Engineering", "Generate", "Copy Brief", "Save Brief"]:
        assert_touch_target(page.get_by_role("button", name=label))

    if output:
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=output / "generator-320-empty.png", full_page=True)

    page.set_viewport_size({"width": 390, "height": 844})
    assert_no_horizontal_overflow(page)

    phrase = page.get_by_test_id("generated-phrase").inner_text().strip("“”\"")
    page.get_by_role("button", name="Save Brief").click()
    page.get_by_text("1/20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.get_by_role("button", name=f"Copy {phrase}").click()
    assert phrase in page.evaluate("navigator.clipboard.readText()")

    page.get_by_role("button", name="Copy All").click()
    saved_text = page.evaluate("navigator.clipboard.readText()")
    assert "CORPO // BRAINDANCE" in saved_text
    assert "SAVED BRIEFS // 1 ITEM" in saved_text
    assert phrase in saved_text

    page.reload(wait_until="networkidle")
    page.get_by_text("1/20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.get_by_role("button", name=f"Remove {phrase} from saved briefs").click()
    page.get_by_text("0/20", exact=True).wait_for()
    page.get_by_role("button", name="Undo").last.click()
    page.get_by_text("1/20", exact=True).wait_for()

    page.get_by_role("button", name="Clear All").click()
    page.get_by_text("0/20", exact=True).wait_for()
    page.get_by_role("button", name="Undo").last.click()
    page.get_by_text("1/20", exact=True).wait_for()

    if output:
        page.screenshot(path=output / "generator-390-saved.png", full_page=True)

    page.set_viewport_size({"width": 768, "height": 900})
    assert_no_horizontal_overflow(page)
    if output:
        page.screenshot(path=output / "generator-tablet.png", full_page=True)

    page.set_viewport_size({"width": 1440, "height": 1000})
    assert_no_horizontal_overflow(page)
    if output:
        page.screenshot(path=output / "generator-desktop.png", full_page=True)

    assert not page_errors, page_errors
    context.close()

    motion_context = browser.new_context(viewport={"width": 1024, "height": 900}, reduced_motion="no-preference")
    motion_page = motion_context.new_page()
    motion_errors: list[str] = []
    motion_page.on("pageerror", lambda error: motion_errors.append(str(error)))
    motion_page.goto(base_url, wait_until="networkidle")
    motion_page.locator("h1.hero-lockup").wait_for()
    assert motion_page.locator(".cyber-grid").evaluate("element => getComputedStyle(element).animationName") == "grid-drive"

    motion_page.get_by_role("button", name="Generate").click()
    motion_page.wait_for_function(
        "document.querySelector('.neural-frame')?.dataset.transmitting === 'true'",
        timeout=1000,
    )
    assert motion_page.locator(".transmission-beam").evaluate(
        "element => getComputedStyle(element).animationName"
    ) == "transmission-sweep"
    assert motion_page.get_by_test_id("generated-phrase").evaluate(
        "element => getComputedStyle(element).animationName"
    ) == "phrase-decode"
    if output:
        motion_page.screenshot(path=output / "generator-motion-enabled.png", full_page=True)
    assert not motion_errors, motion_errors
    motion_context.close()

    browser.close()
