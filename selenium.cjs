const { Builder, By } = require('selenium-webdriver');

async function runSeleniumExample() {
  // Создание экземпляра webdriver для Chrome
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // Открытие веб-сайта
    await driver.get('https://www.example.com');

    // Поиск элемента по его ID
    const element = await driver.findElement(By.id('element_id'));

    // Интеракция с элементом
    await element.sendKeys('Привет, мир!');
    await element.click();

    // Проверка, что элемент присутствует на странице
    const isElementPresent = await driver.findElement(By.id('element_id')).isDisplayed();
    console.log('Элемент присутствует на странице:', isElementPresent);
  } finally {
    // Закрытие webdriver
    await driver.quit();
  }
}

// Запуск примера Selenium
runSeleniumExample();