import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Use the Stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

function searchify(str) {
    return str.replace(/ /g, "-");
}

async function main({ pagination = 0, search = null }) {
    let movie = [];
    const baseURL = 'https://myflixerz.to';
    let url = baseURL + '/movie';

    // Launch a new browser instance
    const browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.6.0.min.js' });

    if (pagination) {
        url = `https://myflixerz.to/movie?page=${pagination}`;
    } else if (search) {
        url = `https://myflixerz.to/search/${searchify(search)}`;
    }

    // Navigate to the URL
    await page.goto(url);

    // Extract movie data
    movie = await page.evaluate(() => {
        const baseURL = 'https://myflixerz.to';
        const movies = [];
        $('div.flw-item').each(function() {
            const name = $(this).find('.film-name > a').attr('title');
            const link = baseURL + $(this).find('.film-name > a').attr('href');
            const poster = $(this).find('img').attr('data-src');
            const year = $(this).find('.fd-infor > span:nth-child(1)').text();
            const duration = $(this).find('.fd-infor > .fdi-duration').text();
            const type = $(this).find('.fd-infor > .fdi-type').text();
            movies.push({ name, poster, year, duration, type, link });
        });
        return movies;
    });

    console.log(movie);
    console.log(`Page : ${pagination ? pagination : 1}`);
    console.log(`Search : ${search ? search : 'n/a'}`);
    console.log(`Total Movies : ${movie.length}`);
    console.log(page.url());

    // Close the browser
    await browser.close();
}

// Call the main function with pagination as 1
main({ pagination: 1 });
