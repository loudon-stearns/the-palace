import { test, expect } from '@playwright/test';

// Launch Interactive (v2.0 Phase 1.2) — the QUEUE's "launch interactive" action
// on a handoff_ready item opens a modal with a ready catch-the-baton prompt to
// paste into an interactive session you can watch + steer.
//
// Hermetic ?demo=only; render + open only. We never click MARK PICKED UP (that
// posts a handoff_picked_up to the live board) nor LAUNCH TERMINAL (that POSTs
// /api/launch and would open a real Terminal) nor OPEN IN DESKTOP (a real Claude
// app session) — those paths are covered at the model level
// (handoff-builder.test.js, launch-server.test.js, launch-middleware.test.js).

async function gotoQueue(page) {
  await page.goto('/?demo=only&deck=QUEUE');
  await expect(page.getByTestId('board-screen')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="queue-open"], [data-testid="queue-resolved"]').first())
    .toBeVisible({ timeout: 15_000 });
}

test.describe('Launch Interactive — handoff pickup', () => {
  test('an open handoff_ready exposes a "launch interactive" action', async ({ page }) => {
    await gotoQueue(page);
    const launch = page.getByTestId('queue-item-launch').first();
    await expect(launch).toBeVisible();
    await expect(launch).toContainText(/launch interactive/i);
  });

  test('clicking it opens a modal with the catch-the-baton prompt + copy + mark-picked-up', async ({ page }) => {
    await gotoQueue(page);
    await page.getByTestId('queue-item-launch').first().click();
    const modal = page.getByTestId('launch-modal');
    await expect(modal).toBeVisible();
    const prompt = page.getByTestId('launch-prompt');
    await expect(prompt).toContainText(/catching an in-progress baton/i);
    await expect(prompt).toContainText('CLAUDE.md');
    await expect(page.getByTestId('launch-copy')).toBeVisible();
    await expect(page.getByTestId('launch-mark-picked-up')).toBeVisible();
    // The one-click "launch terminal" action is offered too (not clicked here —
    // it would POST /api/launch and open a real Terminal), and beside it "open
    // in desktop" (not clicked either — it would open a real Claude app session).
    await expect(page.getByTestId('launch-terminal')).toBeVisible();
    await expect(page.getByTestId('launch-desktop')).toBeVisible();
    await expect(page.getByTestId('launch-desktop-note')).toContainText(/own model, effort and permission mode/);
    // Esc closes without posting anything.
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);
  });
});
