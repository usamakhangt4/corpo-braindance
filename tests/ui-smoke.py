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
    )
    page = context.new_page()
    page_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))

    response = page.goto(base_url, wait_until="load")
    assert response and response.ok, response.status if response else "no response"
    page.get_by_role("heading", name="CORPO // BRAINDANCE").wait_for()

    menu_trigger = page.get_by_role("button", name="Toggle menu")
    menu_trigger.click()
    dialog = page.get_by_role("dialog", name="Mobile navigation")
    dialog.wait_for()
    assert dialog.get_attribute("aria-modal") == "true"
    page.wait_for_function(
        "element => element.contains(document.activeElement)",
        arg=dialog.element_handle(),
    )
    assert dialog.evaluate("element => element.contains(document.activeElement)")
    page.keyboard.press("Tab")
    assert dialog.evaluate("element => element.contains(document.activeElement)")
    page.keyboard.press("Escape")
    dialog.wait_for(state="hidden")
    assert menu_trigger.evaluate("element => document.activeElement === element")

    phrase = page.get_by_test_id("generated-phrase").inner_text().strip("“”")
    page.get_by_role("button", name="File to dossier").click()
    page.get_by_text("1/20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.reload(wait_until="load")
    page.get_by_text("1/20", exact=True).wait_for()
    page.get_by_text(phrase, exact=True).wait_for()

    page.goto(f"{base_url}/hall-of-shame/", wait_until="load")
    page.get_by_role("heading", name="HALL // OF SHAME").wait_for()
    local_entry = page.get_by_role("article").filter(has_text="Your dossier").filter(has_text=phrase).first
    local_entry.wait_for()
    assert "your dossier" in local_entry.inner_text().lower()

    promote = local_entry.get_by_role("button", name="Promote this phrase")
    promote.click()
    assert promote.get_attribute("aria-pressed") == "true"

    page.reload(wait_until="load")
    local_entry = page.get_by_role("article").filter(has_text="Your dossier").filter(has_text=phrase).first
    assert local_entry.get_by_role("button", name="Promote this phrase").get_attribute("aria-pressed") == "true"

    if artifact_dir:
        output = Path(artifact_dir)
        output.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=output / "hall-of-shame-mobile.png", full_page=True)
    page.goto(base_url, wait_until="load")
    page.get_by_role("heading", name="CORPO // BRAINDANCE").wait_for()

    if artifact_dir:
        page.screenshot(path=Path(artifact_dir) / "generator-mobile.png", full_page=True)

    page.set_viewport_size({"width": 1440, "height": 1000})
    assert page.get_by_role("link", name="Hall of Shame").is_visible()
    assert not page.get_by_role("button", name="Toggle menu").is_visible()

    if artifact_dir:
        page.screenshot(path=Path(artifact_dir) / "generator-desktop.png", full_page=True)

    assert not page_errors, page_errors
    context.close()
    browser.close()
