import os
from pathlib import Path

from playwright.sync_api import sync_playwright


base_url = os.getenv("BASE_URL", "http://127.0.0.1:3100")
artifact_dir = os.getenv("ARTIFACT_DIR")
output = Path(artifact_dir) if artifact_dir else None

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, channel="chrome")
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        reduced_motion="reduce",
        permissions=["clipboard-read", "clipboard-write"],
    )
    page = context.new_page()
    page_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))

    response = page.goto(base_url, wait_until="load")
    assert response and response.ok, response.status if response else "no response"
    page.get_by_role("heading", name="CORPO // BRAINDANCE").wait_for()
    page.get_by_role("heading", name="Saved Briefs").wait_for()
    page.get_by_text("No saved briefs yet.", exact=False).wait_for()
    assert page.get_by_text("Neural Dossier", exact=True).count() == 0

    if output:
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=output / "saved-briefs-empty-mobile.png", full_page=True)

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

    page.reload(wait_until="load")
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
        page.screenshot(path=output / "generator-mobile.png", full_page=True)

    page.set_viewport_size({"width": 1440, "height": 1000})
    page.get_by_role("heading", name="Saved Briefs").wait_for()

    if output:
        page.screenshot(path=output / "generator-desktop.png", full_page=True)

    assert not page_errors, page_errors
    context.close()
    browser.close()
