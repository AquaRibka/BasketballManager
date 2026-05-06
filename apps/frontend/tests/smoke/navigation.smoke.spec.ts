import { expect, test } from '@playwright/test';

const backendUrl = process.env.FRONTEND_SMOKE_API_URL ?? 'http://127.0.0.1:3000';

type TeamsResponse = {
  items: Array<{
    id: string;
    name: string;
    shortName: string;
  }>;
};

async function getSeedTeam() {
  const response = await fetch(`${backendUrl}/teams`);

  if (!response.ok) {
    throw new Error(`Teams API failed with HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as TeamsResponse;
  const seedTeam = payload.items.find((team) => team.shortName === 'TSTA') ?? payload.items[0];

  if (!seedTeam) {
    throw new Error('Smoke seed data is missing teams.');
  }

  return seedTeam;
}

test.describe('frontend smoke navigation', () => {
  test('opens core pages and loads seed data', async ({ page }) => {
    const seedTeam = await getSeedTeam();

    await page.goto('/teams');
    await expect(page.getByRole('heading', { name: 'Список команд' })).toBeVisible();
    await expect(page.getByText('Backend доступен. Команды загружены')).toBeVisible();
    await page.getByRole('link', { name: new RegExp(seedTeam.name) }).click();

    await expect(page.getByRole('heading', { name: seedTeam.name })).toBeVisible();
    await expect(page.getByText('игроков в ростере')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Назад к списку команд' })).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Основные разделы' })
      .getByRole('link', { name: 'Календарь' })
      .click();
    await expect(page.getByRole('heading', { name: 'Test League 2026' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Матчи сезона по турам' })).toBeVisible();
    await expect(page.getByText('Раунд 1').first()).toBeVisible();
    await expect(page.locator('.match-card').filter({ hasText: 'TSTA' }).first()).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Основные разделы' })
      .getByRole('link', { name: 'Таблица' })
      .click();
    await expect(page.getByRole('heading', { name: 'Test League 2026' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Турнирная таблица сезона' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'TSTA' })).toBeVisible();
  });
});
