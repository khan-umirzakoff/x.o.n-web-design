import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("http://localhost:3019")

        # Wait for the canvas to be visible
        await page.wait_for_selector('canvas', timeout=10000)

        # Get the bounding box of the canvas
        canvas = await page.query_selector('canvas')
        if canvas:
            box = await canvas.bounding_box()
            if box:
                # Move the mouse to the center of the canvas
                await page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)

                # Wait for the animation to happen
                await page.wait_for_timeout(2000)

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

asyncio.run(main())
