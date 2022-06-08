const { journey, step, expect } = require('@elastic/synthetics');

const { chromium } = require('playwright');  // Or 'firefox' or 'webkit'.

const URL = 'https://www.betking.com/sports/s';

const placeSingleBet = (page, params) => {
  step('visit landing page', async () => {
    await page.goto(params.url || URL, {waitUntil: 'networkidle'});
    // check to make sure BetKing app is loaded
    const productImages = await page.innerText('//h2[@class=\'panel-title custom inverseHTag\']/span[1]');
    await console.log(productImages);
    expect(productImages.length).toBe(10);
  });

  step('login to BetKing', async () => {
    const productImages = await page.innerText('//h2[@class=\'panel-title custom inverseHTag\']/span[1]');
    const username = "QATestOnline2";
    const password = "TFNeQbEn5Y6du7C";
    await page.fill('//input[@id="txtLoginUsername"]', username);
    await page.fill('//input[@id="txtLoginPassword"]', password);
    await Promise.all([
      await page.click('//button[@class=\'login-button\']'),
    ]);
    await page.waitForSelector("//div[@class='account-shop-button']");
  });

  step('place single bet', async () => {
    await page.goto(params.url || URL, {waitUntil: 'networkidle'});
    let fetchedEventIds = [];
    await page.waitForSelector("//div[@class='upcomingEvents']//span[contains(@class,'chart')]");
    const eventIdList = await page.locator("//div[@class='upcomingEvents']//span[contains(@class,'chart')]");
    console.log(await eventIdList.count());
    var eventIdCount = await eventIdList.count();
    console.log(eventIdCount);
    let oddsInfo = {};
    let numberOfOddsToSelect = 1;
    let numberOfEventsToSelect = 1;
    for (let j = 0; j < eventIdCount; j++) {
      let eventId = (await eventIdList.nth(j).innerText()).trim();
      console.log("Selected  Event ID: " + eventId);
      fetchedEventIds.push(eventId);
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForSelector("//h2[@class='panel-title custom inverseHTag']/span");
      let odd_list = await page.locator("//span[contains(@class,'chart' ) and contains (.," + eventId + ")]//ancestor::tr/td[not(contains(@class,'more'))]//a[not(contains(.,'-'))]");
      let oddListCount = await odd_list.count();
      console.log(oddListCount);
      if (oddListCount < 4) {
        console.log('Odd count is less than 3.');
      }
      else
      {
        if (numberOfOddsToSelect > oddListCount)
        {
          await page.expect('Number of odds to select were greater than available odds count.' +
              '\nSelection odds count: ' + numberOfOddsToSelect + '\nAvailable odds count: ' + oddListCount);}

        oddsInfo[eventId] = [];
        let oddsSelected = [];
        for (let i = 0; i < numberOfOddsToSelect; i++) {
          let oddId = (await odd_list.nth(i).innerText()).trim();
          oddsInfo[eventId].push(oddId);
          await console.log(oddId);
          await odd_list.nth(i).click();
          console.log("Selected odd: " + oddId);
          oddsSelected.push(oddId);
        }
        let stakeValue = 120;
        await page.waitForSelector("//input[@id='txtAmount']");
        await page.focus("//input[@id='txtAmount']");
        for (let i = 0; i < 3; i++) {
          await page.keyboard.press('Backspace');
        }
        await page.type("//input[@id='txtAmount']", stakeValue.toString());
        console.log(await page.innerText("//button[contains(@class,'placeBet')]"));
        await page.click("//button[contains(@class,'placeBet')]");
        //*[@id="69898"]/div/span
        //*[@id="6834"]/div/span
        await page.waitForSelector("//button[@class='swal2-confirm btn-confirm']");
        await page.click("//button[@class='swal2-confirm btn-confirm']");
        await page.waitForSelector("//div[@id='couponSaved']");
        let betSavedText = await page.innerText("//div[@id='couponSaved']");
        console.log(betSavedText);
        break;
      }
      j++;
    }
  });
};

journey(
    {name: 'place single bet sportsbook', tags: ['browse']},
    ({page, params}) => {
      placeSingleBet(page, params);
      step('look for saved coupon', async () => {
        const recommendationsNode = await page.$("//div[@id='couponSaved']");
        expect(recommendationsNode).toBeDefined();

      });
    }
);


//
//       step('verify bet', async () => {
//         expect(page.url()).toContain('checkout');
//         const containerNode = await page.$('.container .row');
//         const content = await containerNode.textContent();
//         expect(content).toContain('Your order is complete');
//         expect(content).toContain('Order Confirmation');
//       });
//     }
// );

