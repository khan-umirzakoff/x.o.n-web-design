from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:3001")
            # Wait for the hero section to be visible to ensure the page is loaded
            hero_selector = "div.container"
            page.wait_for_selector(hero_selector, timeout=30000) # 30 seconds timeout
            # Give the 3D scene some time to render
            page.wait_for_timeout(5000) # 5 seconds
            page.screenshot(path="jules-scratch/verification/text_moved.png")
            print("Screenshot taken successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
