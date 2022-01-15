const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const nodeSchedule = require('node-schedule');

const chromePaths = require('chrome-paths');

const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');
const delay = require('delay');
const readlineSync = require('readline-sync');
const NodeCache = require("node-cache");
const myCache = new NodeCache();


(async () => {
    console.log('')
    let tradeTypeValue = readlineSync.question('Pakai akun demo / real ex. (demo/real) ? ');

    let amount = readlineSync.question('set Amount ex 20000, jangan diisi jika memilih default 14000 ? ');
    let compent = readlineSync.question('set berapa kompensasi ex 7, jangan diisi jika memilih default 1 kompensasi ? ');


    if (!amount) {
        amount = '14000';
    }

    if (!compent) {
        compent = '1';
    }

    const tradeType = ['demo', 'real'];
    if (!tradeType.includes(tradeTypeValue)) {
        console.log(chalk.yellow(`Type trade hanya ada ${tradeType}`));
        process.exit(0)
    }
    console.log('')

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--no-first-run',
        '--disable-dev-shm-usage',
        '--window-size=1920x1080'
    ];


    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        executablePath: chromePaths.chrome,
        userDataDir: './tmp',
        slowMo: 0,
        devtools: false,
        args
    });


    const pages = await browser.pages();
    const page = pages[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://quotex-broker.com/id/trade', {
        waitUntil: 'networkidle0',
        timeout: 120000,
    });

    let loginRequired = false;

    if ((await page.$('#tab-1 > form > button > div')) !== null) {
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Kamu harus login terlebih dahulu'));
        loginRequired = true
    } else {
        loginRequired = false
    }

    if (loginRequired) {
        const isLogin = readlineSync.question('Tekan enter jika sudah login [ENTER]');
        console.log('')

        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu > div');
        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.usermenu > div").click());

        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(1) > div.usermenu__block > div > div');
        let loginName = await page.$('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(1) > div.usermenu__block > div > div');
        let loginNameValue = await page.evaluate(el => el.textContent, loginName);
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil login dengan akun : ${loginNameValue}`));
    } else {
        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu > div');
        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.usermenu > div").click());

        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(1) > div.usermenu__block > div > div');
        let loginName = await page.$('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(1) > div.usermenu__block > div > div');
        let loginNameValue = await page.evaluate(el => el.textContent, loginName);
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil login dengan akun : ${loginNameValue}`));
    }



    await page.goto('https://quotex-broker.com/id/trade', {
        waitUntil: 'networkidle0',
        timeout: 120000,
    });

    if (tradeTypeValue == 'demo') {
        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu > div');
        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.usermenu > div").click());

        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__info.active > div:nth-child(2) > div.usermenu__info-name');
        let checkLocationAccount = await page.$('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__info.active > div:nth-child(2) > div.usermenu__info-name');
        let locationAccountValue = await page.evaluate(el => el.textContent, checkLocationAccount);
        if (locationAccountValue.toLowerCase().includes('live')) {
            await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(3) > a');
            await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(3) > a").click());
        }
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Trading menggunakan akun Demo'));
    } else if (tradeTypeValue == 'real') {

        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu > div');
        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.usermenu > div").click());

        await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__info.active > div:nth-child(2) > div.usermenu__info-name');
        let checkLocationAccount = await page.$('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__info.active > div:nth-child(2) > div.usermenu__info-name');
        let locationAccountValue = await page.evaluate(el => el.textContent, checkLocationAccount);

        if (locationAccountValue.toLowerCase().includes('demo')) {
            await page.waitForSelector('#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(2) > a');
            await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > header > div.header__container > div.usermenu.active > div.usermenu__dropdown > ul.usermenu__select > li:nth-child(2) > a").click());
        }


        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Trading menggunakan akun Real'));
    }

    // #root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(2)



    await page.waitForSelector('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__time.section-deal__input-black > label > span.input-control__label__switch');
    await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__time.section-deal__input-black > label > span.input-control__label__switch").click());

    await page.waitForSelector('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__time.section-deal__input-black > label > span.input-control__label__switch');
    await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__time.section-deal__input-black > label > span.input-control__label__switch").click());

    await page.waitForSelector('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__time.section-deal__input-black > label > div > div:nth-child(1)');
    await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__time.section-deal__input-black > label > div > div:nth-child(1)").click());

    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Trading dimulai dengan amount : ${amount}`));
    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Kompensasi jika lose akan dilakukan sebanyak ${compent}x secara berturut`));
    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Kompensasi dilakukan dengan cara satu arah.'));
    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green('Start Trading...'));
    console.log('');

    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
    const foo1 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
    await foo1.click({ clickCount: 3 });
    await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
    await delay(2000);

    fs.writeFileSync('login.bak', tradeTypeValue, 'utf-8');

    const timeList = await fs.readFileSync('./time.txt', 'utf-8');
    const timeArray = timeList.split('\n');
    for (let index = 0; index < timeArray.length; index++) {
        const element = timeArray[index];

        if (element) {
            const hours = element.split(':')[0];
            const minute = element.split(':')[1].split(' ')[0];
            const type = element.split(':')[1].split(' ')[1];
            nodeSchedule.scheduleJob({ hour: minute == '00' ? hours - 1 : hours, minute: minute == '00' ? '59' : minute - 1 }, async () => {
                const haveCompent = myCache.get('compent');

                if (!haveCompent) {
                    if (type == 'B') {
                        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Buy at ${minute == '00' ? hours - 1 : hours}:${minute == '00' ? '59' : minute - 1} ...`));
                        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__put > div.section-deal__success > button > span").click());
                        await delay(59000);

                        await page.waitForSelector('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                        let profitCheck = await page.$('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                        let profitCheckValue = await page.evaluate(el => el.textContent, profitCheck);
                        if (!profitCheckValue.includes('+')) {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Tidak profit : ${profitCheckValue}`));
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Next kompensasi.`));

                            myCache.set('compent', {
                                position: 1,
                                to: parseInt(compent)
                            })

                            let jumlahTrade = Math.ceil(parseInt(amount) * 2.5);
                            jumlahTrade = Math.ceil(parseInt(jumlahTrade));
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));

                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                            const foo2 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                            await foo2.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())
                            await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__put > div.section-deal__success > button > span").click());
                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                            const foo3 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                            await foo3.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString())

                            const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                            const nextSignal = timeArray[indexOfTimeLost + 1];

                            if (nextSignal) {

                                await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                const foo4 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                await foo4.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())

                                await delay(60000);

                                await page.waitForSelector('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                let profitCheckCompen = await page.$('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckCompen);
                                if (!profitCheckValueAfterCompen.includes('+')) {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                    if (parseInt(compent) > 1) {
                                        myCache.set('compent', {
                                            position: 2,
                                            to: parseInt(compent),
                                            amount: Math.ceil(parseInt(amount) * 2.5)
                                        })

                                        let checkCompent = myCache.get('compent');
                                        if (checkCompent) {
                                            do {
                                                checkCompent = myCache.get('compent');
                                                if (checkCompent) {
                                                    let jumlahTrade = parseInt(checkCompent.amount) * 2.5;
                                                    jumlahTrade = Math.ceil(parseInt(jumlahTrade));
                                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi ke ${checkCompent.position} dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));

                                                    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                    const foo5 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                    await foo5.click({ clickCount: 3 });
                                                    await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())

                                                    const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                                                    const nextSignal = timeArray[indexOfTimeLost + 1];

                                                    if (nextSignal) {

                                                        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__put > div.section-deal__success > button > span").click());


                                                        await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                        const foo6 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                        await foo6.click({ clickCount: 3 });
                                                        await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())


                                                        await delay(60000);

                                                        await page.waitForSelector('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                                        let profitCheckCompen = await page.$('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                                        let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckCompen);
                                                        if (!profitCheckValueAfterCompen.includes('+')) {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi ke ${checkCompent.position} tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                                            myCache.set('compent', {
                                                                position: checkCompent.position + 1,
                                                                to: parseInt(compent),
                                                                amount: jumlahTrade
                                                            })



                                                            if (checkCompent.position == checkCompent.to) {
                                                                myCache.del('compent')
                                                                await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                                const foo7 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                                await foo7.click({ clickCount: 3 });
                                                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                                            }

                                                        } else {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi ke ${checkCompent.position} profit : ${profitCheckValueAfterCompen}`));
                                                            myCache.del('compent')
                                                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                            const foo8 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                            await foo8.click({ clickCount: 3 });
                                                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                                        }
                                                    }
                                                }
                                            } while (checkCompent);
                                        }
                                    }

                                    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                    const foo9 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                    await foo9.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString())

                                } else {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi profit : ${profitCheckValueAfterCompen}`));
                                    myCache.del('compent')
                                    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                    const foo10 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                    await foo10.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                }

                                await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                const foo11 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                await foo11.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString())

                                console.log('')

                            } else {
                                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Tidak ada sinyal selanjutnya.'));
                                process.exit(0);
                            }



                        } else {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Profit guys : ${profitCheckValue}`));
                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                            const foo12 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                            await foo12.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                        }



                        console.log('');
                        await delay(2000);
                    } else if (type == 'S') {
                        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Sell at ${minute == '00' ? hours - 1 : hours}:${minute == '00' ? '59' : minute - 1} ...`));
                        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__put > div.section-deal__success > button > span").click());
                        await delay(59000);

                        await page.waitForSelector('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                        let profitCheck = await page.$('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                        let profitCheckValue = await page.evaluate(el => el.textContent, profitCheck);
                        if (!profitCheckValue.includes('+')) {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Tidak profit : ${profitCheckValue}`));
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Next kompensasi.`));

                            myCache.set('compent', {
                                position: 1,
                                to: parseInt(compent)
                            })

                            let jumlahTrade = Math.ceil(parseInt(amount) * 2.5);
                            jumlahTrade = Math.ceil(jumlahTrade);
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));



                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                            const foo13 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                            await foo13.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())
                            await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__put > div.section-deal__success > button > span > svg").click());
                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                            const foo14 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                            await foo14.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString())

                            const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                            const nextSignal = timeArray[indexOfTimeLost + 1];
                            if (nextSignal) {


                                await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                const foo15 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                await foo15.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())

                                await delay(60000);

                                await page.waitForSelector('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                let profitCheckCompen = await page.$('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckCompen);
                                if (!profitCheckValueAfterCompen.includes('+')) {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                    if (parseInt(compent) > 1) {
                                        myCache.set('compent', {
                                            position: 2,
                                            to: parseInt(compent),
                                            amount: Math.ceil(parseInt(amount) * 2.5)
                                        })

                                        let checkCompent = myCache.get('compent');

                                        if (checkCompent) {
                                            do {
                                                checkCompent = myCache.get('compent');
                                                if (checkCompent) {
                                                    let jumlahTrade = parseInt(checkCompent.amount) * 2.5;
                                                    jumlahTrade = Math.ceil(jumlahTrade);
                                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Melakukan kompensasi ke ${checkCompent.position} dengan jumlah ${Math.ceil(parseInt(jumlahTrade))}`));

                                                    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                    const foo16 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                    await foo16.click({ clickCount: 3 });
                                                    await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())

                                                    const indexOfTimeLost = timeArray.findIndex(x => x.includes(element));
                                                    const nextSignal = timeArray[indexOfTimeLost + 1];

                                                    if (nextSignal) {

                                                        await page.evaluate(() => document.querySelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__put > div.section-deal__success > button > span > svg").click());


                                                        await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                        const foo17 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                        await foo17.click({ clickCount: 3 });
                                                        await page.keyboard.type(Math.ceil(parseInt(jumlahTrade)).toString())



                                                        await delay(60000);

                                                        await page.waitForSelector('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                                        let profitCheckCompen = await page.$('#root > div > div.page.app__page > main > div.page__content > div > div.trades-notifications > div:nth-child(1) > div.trades-notifications-item__total');
                                                        let profitCheckValueAfterCompen = await page.evaluate(el => el.textContent, profitCheckCompen);
                                                        if (!profitCheckValueAfterCompen.includes('+')) {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.red(`Kompensasi ke ${checkCompent.position} tidak menghasilkan :'( : ${profitCheckValueAfterCompen}`));
                                                            myCache.set('compent', {
                                                                position: checkCompent.position + 1,
                                                                to: parseInt(compent),
                                                                amount: Math.ceil(parseInt(jumlahTrade)).toString()
                                                            })



                                                            if (checkCompent.position == checkCompent.to) {
                                                                myCache.del('compent')
                                                                await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                                const foo18 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                                await foo18.click({ clickCount: 3 });
                                                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                                            }

                                                        } else {
                                                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi ke ${checkCompent.position} profit : ${profitCheckValueAfterCompen}`));
                                                            myCache.del('compent')
                                                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                                            const foo19 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                                            await foo19.click({ clickCount: 3 });
                                                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                                        }
                                                    }
                                                }
                                            } while (checkCompent);
                                        }
                                    }
                                    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                    const foo20 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                    await foo20.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                } else {
                                    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Kompensasi profit : ${profitCheckValueAfterCompen}`));
                                    myCache.del('compent');
                                    await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                    const foo21 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                    await foo21.click({ clickCount: 3 });
                                    await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                }
                                await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                                const foo22 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                                await foo22.click({ clickCount: 3 });
                                await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                                console.log('')
                            } else {
                                console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow('Tidak ada sinyal selanjutnya.'));
                                process.exit(0);
                            }

                        } else {
                            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.yellow(`Profit guys : ${profitCheckValue}`));
                            await page.waitForSelector("#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input");
                            const foo23 = await page.$('#root > div > div.page.app__page > main > div.page__sidebar > div.sidebar-section.sidebar-section--dark.sidebar-section--large > div > div.section-deal__form > div.section-deal__investment.section-deal__input-black > div > label > input');
                            await foo23.click({ clickCount: 3 });
                            await page.keyboard.type(Math.ceil(parseInt(amount)).toString())
                        }

                        console.log('');
                        await delay(2000);
                    }


                }



            });

        }

    }



})();