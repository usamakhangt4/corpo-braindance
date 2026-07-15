import os
from pathlib import Path

from playwright.sync_api import sync_playwright


base_url = os.getenv("BASE_URL", "http://127.0.0.1:3100")
artifact_dir = os.getenv("ARTIFACT_DIR")

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
    assert page.get_by_role("link", name="Hall of Shame").count() == 0
    assert page.get_by_role("button", name="Toggle menu").count() == 0

    phrase = page.get_by_test_id("generated-phrase").inner_text().strip("“”\"")
    page.get_by_role("button", name="File to dossier").click()
    page.get_by_text("1/20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.get_by_role("button", name=f"Copy {phrase}").click()
    assert phrase in page.evaluate("navigator.clipboard.readText()")

    page.get_by_role("button", name="Copy dossier").click()
    dossier_text = page.evaluate("navigator.clipboard.readText()")
    assert "CORPO // BRAINDANCE" in dossier_text
    assert "NEURAL DOSSIER // 1 RECORD" in dossier_text
    assert phrase in dossier_text

    page.reload(wait_until="load")
    page.get_by_text("1/20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.get_by_role("button", name=f"Remove {phrase} from dossier").click()
    page.get_by_text("0/20", exact=True).wait_for()
    assert page.get_by_text(phrase, exact=True).count() == 0

    page.get_by_role("button", name="File to dossier").click()
    page.get_by_text("1/20", exact=True).wait_for()

    if artifact_dir:
        output = Path(artifact_dir)
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=output / "generator-mobile.png", full_page=True)

    page.set_viewport_size({"width": 1440, "height": 1000})
    page.get_by_role("heading", name="Neural Dossier").wait_for()

    if artifact_dir:
        page.screenshot(path=Path(artifact_dir) / "generator-desktop.png", full_page=True)

    assert not page_errors, page_errors
    context.close()
    browser.close()
