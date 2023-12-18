export async function login(page: Page, email: string, password: string) {
  await page.locator('#id_user_id label').click();
  await page.locator('#id_user_id label').fill(email);
  await page.locator('#id_password label').click();
  await page.locator('#id_password label').fill(password);
  await page.locator('#login-button').click();
}