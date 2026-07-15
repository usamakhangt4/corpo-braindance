from playwright.sync_api import sync_playwright


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, channel="chrome")
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        reduced_motion="reduce",
    )
    page = context.new_page()
    page_errors: list[str] = []
    console_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    response = page.goto("http://127.0.0.1:3100", wait_until="networkidle")
    assert response and response.ok, response.status if response else "no response"
    try:
        page.get_by_role("heading", name="CORPO // BRAINDANCE").wait_for(timeout=5000)
    except Exception as error:
        raise AssertionError(
            f"{page.locator('body').inner_text()}\nPage errors: {page_errors}\nConsole errors: {console_errors}"
        ) from error

    menu_trigger = page.get_by_role("button", name="Toggle menu")
    menu_trigger.click()
    dialog = page.get_by_role("dialog", name="Mobile navigation")
    dialog.wait_for()
    assert dialog.get_attribute("aria-modal") == "true"
    assert dialog.evaluate("element => element.contains(document.activeElement)")

    page.keyboard.press("Tab")
    assert dialog.evaluate("element => element.contains(document.activeElement)")
    page.keyboard.press("Escape")
    dialog.wait_for(state="hidden")
    assert menu_trigger.evaluate("element => document.activeElement === element")

    page.goto("http://127.0.0.1:3100/login", wait_until="networkidle")
    identifier = page.locator("#emailOrUsername")
    password = page.locator("#password")
    assert identifier.get_attribute("name") == "identifier"
    assert identifier.get_attribute("autocomplete") == "username"
    assert password.get_attribute("autocomplete") == "current-password"
    assert not page_errors, page_errors

    context.close()
    browser.close()
