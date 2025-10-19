
module.exports = {
  selectOneElement,
  selectRandomElement,
  selectChair,
  clickElement,
  clickSelector,
  getText,
};

async function searchAllElements(page, selector) {
  try {
    await page.waitForSelector(selector);
    return await page.$$(selector);
  } catch (error) {
    throw new Error(`No elements found for selector: ${selector}`);
  }
}

async function selectOneElement(page, selector, number) {
  try {
    const elements = await searchAllElements(page, selector);
    if (!elements || elements.length === 0) {
      throw new Error(`Элементы с селектором ${selector} не найдены`);
    }
    if (number >= elements.length) {
      throw new Error(`Элемент номер ${number} не существует. Всего элементов: ${elements.length}`);
    }
    return elements[number];
  } catch (error) {
    throw new Error(`Element number ${number} not selected: ${error.message}`);
  }
}

async function selectChair(page, row, rowSelector, chair, chairSelector, flagTaken, takenSelector) {
  try {
    let takenStatus;
    let selectRow;
    let seat;
    do {
      selectRow = await selectOneElement(page, rowSelector, row);
      const numberOfChairs = (await searchAllElements(page, rowSelector)).length;
      seat = await selectOneElement(selectRow, chairSelector, chair);
      if (flagTaken && chair < numberOfChairs - 1) {
        console.log(`Стул ${chair + 1} в ${row + 1} ряду занят, проверяю ${chair + 2} стул`);
        chair++;
      } else {
        console.log(`Перехожу на ${row + 2} ряд`);
        row++;
        chair = 0;
      }
      takenStatus = await seat.evaluate((el, taken) => el.classList.contains(taken), takenSelector);
    } while (flagTaken && takenStatus);

    return seat;
  } catch (error) {
    throw new Error(`Seat in row ${row} and chair ${chair} not selected`);
  }
}

async function selectRandomElement(page, selector) {
  try {
    const elements = await searchAllElements(page, selector);
    const numberOfElements = elements.length;
    console.log("Количество селекторов на странице: " + numberOfElements);
    const number = Math.floor(Math.random() * (numberOfElements - 1));
    return await elements[number];
  } catch (error) {
    throw new Error(`Random selection is not available for selector: ${selector}`);
  }
}

async function clickElement(el) {
  try {
    await el.click();
  } catch (error) {
    throw new Error(`Element is not clickable: ${el}`);
  }
}

async function clickSelector(page, selector) {
  try {
    await page.waitForSelector(selector);
    await page.click(selector);
  } catch (error) {
    throw new Error(`Selector is not clickable: ${selector}`);
  }
}

async function getText(page, selector) {
  try {
    await page.waitForSelector(selector);
    return await page.$eval(selector, (link) => link.textContent);
  } catch (error) {
    throw new Error(`Text is not available for selector: ${selector}`);
  }
}
