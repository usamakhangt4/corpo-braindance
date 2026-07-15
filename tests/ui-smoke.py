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
    assert response and response.ok, response.status if response else "No response"
    page.get_by_role("heading", name="Make nothing sound strategic.").wait_for()
    page.get_by_role("heading", name="Archived briefs").wait_for()
    page.get_by_text("Nothing archived.", exact=True).wait_for()
    page.get_by_text("VOICE / RANDOM", exact=True).wait_for()
    page.get_by_text("SCOPE / ALL STACKS", exact=True).wait_for()
    assert page.get_by_role("region", name="Tune generation").count() == 0
    assert_no_horizontal_overflow(page)

    for label in ["Tune", "Generate jargon", "Copy memo", "Save brief"]:
        assert_touch_target(page.get_by_role("button", name=label))

    page.get_by_role("button", name="Tune").click()
    profile = page.get_by_role("region", name="Tune generation")
    profile.wait_for()
    page.get_by_role("button", name="ENGINEERING", exact=True).click()
    page.get_by_role("button", name="CYBERSECURITY", exact=True).click()
    page.get_by_role("button", name="Apply & generate").click()
    assert profile.count() == 0
    page.get_by_text("VOICE / ENGINEERING", exact=True).wait_for()
    page.get_by_text("STACK / CYBERSECURITY", exact=True).wait_for()
    assert_no_horizontal_overflow(page)

    if output:
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=output / "generator-tuned-320.png", full_page=True)

    phrase = page.get_by_test_id("generated-phrase").inner_text().strip("“”\"")
    page.get_by_role("button", name="Save brief").click()
    page.get_by_text("01 / 20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.reload(wait_until="networkidle")
    page.get_by_text("VOICE / ENGINEERING", exact=True).wait_for()
    page.get_by_text("SCOPE / CYBERSECURITY", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.get_by_role("button", name="Tune").click()
    page.keyboard.press("Escape")
    assert page.get_by_role("region", name="Tune generation").count() == 0

    page.get_by_role("button", name="Tune").click()
    page.get_by_role("button", name="Reset to random").click()
    page.get_by_text("VOICE / RANDOM", exact=True).wait_for()
    page.get_by_text("SCOPE / ALL STACKS", exact=True).wait_for()

    page.set_viewport_size({"width": 1440, "height": 1000})
    page.get_by_role("button", name="Tune").click()
    page.get_by_role("region", name="Tune generation").wait_for()
    assert_no_horizontal_overflow(page)
    if output:
        page.screenshot(path=output / "generator-profile-desktop.png", full_page=True)

    assert not page_errors, page_errors
    context.close()
    browser.close()
