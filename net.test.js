const {
  selectOneElement,
  selectRandomElement,
  selectChair,
  clickElement,
  clickSelector,
  getText,
} = require("./lib/commands.js");
const { generateName } = require("./lib/util.js");

let page;
const daySelector = "a.page-nav__day";
const timeSelector = "a.movie-seances__time:not(.acceptin-button-disabled)";
const rowSelector = ".buying-scheme__row";
const chairSelector = ".buying-scheme__chair";
const chairNotTakenSelector = ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)";
const buttonSelector = "button.acceptin-button";
const takenSelector = "buying-scheme__chair_taken";

beforeEach(async () => {
  page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
});

afterEach(() => {
  page.close();
});

describe("Ticket Booking Test", () => {
  beforeEach(async () => {
    await page.goto("https://qamid.tmweb.ru/client/index.php");
  });

  //----------------------------------
  test("Positive test. Booking by row and chair", async () => {
    const day = 3;
    const time = 3;
    const row = 2;
    const chair = 1;
    const flagTaken = true;

    const dayOfWeek = await selectOneElement(page, daySelector, day);
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await dayOfWeek.click();

    const seanceTime = await selectOneElement(page, timeSelector, time);
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await seanceTime.click();

    await page.waitForNavigation();

    const selectedSeat = await selectChair(
      page,
      row,
      rowSelector,
      chair,
      chairSelector,
      flagTaken,
      takenSelector
    );

    await clickElement(selectedSeat);

    await clickSelector(page, buttonSelector);
    await page.waitForTimeout(1_000);

    await page.waitForSelector(buttonSelector);
    const actual = await getText(page, buttonSelector);
    await expect(actual).toContain("Получить код бронирования");
    await clickSelector(page, buttonSelector);
  }, 120_000);

  //----------------------------------
  test("Positive test. Booking by selected parameters", async () => {
    const day = 3;
    const time = 2;
    const chair = 5;

    const dayOfWeek = await selectOneElement(page, daySelector, day);
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await clickElement(dayOfWeek);

    const seanceTime = await selectOneElement(page, timeSelector, time);
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await clickElement(seanceTime);

    await page.waitForNavigation();

    const freeChair = await selectOneElement(page, chairNotTakenSelector, chair);
    await clickElement(freeChair);

    await clickSelector(page, buttonSelector);
    await page.waitForNavigation();

    await page.waitForSelector(buttonSelector);
    const actual = await getText(page, buttonSelector);
    await expect(actual).toContain("Получить код бронирования");
    await clickSelector(page, buttonSelector);
  });

  //----------------------------------
  test("Negative test. Cancel chair selection", async () => {
    const day = 2;
    const time = 1;
    const chairs = [5, 34, 22];

    const dayOfWeek = await selectOneElement(page, daySelector, day);
    console.log("Дата сеанса : " + (await dayOfWeek.evaluate((el) => el.textContent)));
    await clickElement(dayOfWeek);

    const seanceTime = await selectOneElement(page, timeSelector, time);
    console.log("Время сеанса : " + (await seanceTime.evaluate((el) => el.textContent)));
    await clickElement(seanceTime);

    await page.waitForNavigation();

    for (let i = 0; i < 2; i++) {
      // первая итерация - выбор стульев, вторая итерация - отмена выбора
      for (let chair of chairs) {
        const freeChair = await selectOneElement(page, chairNotTakenSelector, chair);
        await clickElement(freeChair);
      }
    }

    await page.waitForTimeout(1000);
    const actual = await page.$eval(buttonSelector, (link) => link.disabled);
    await expect(actual).toBe(true);
  });
});
