const crawler = require("crawler");
const fs = require("fs");

let results = [];
let result = {};
let id = 0;

const c = new crawler({
  rateLimit: 1000,
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      const $ = res.$;
      const webResults = $(".search-result-item");
      webResults.each((index, item) => {
        let features = [];
        const title = $(".listitem-title span", item);
        const region = $(".region", item);
        const uri = $(".listitem-title", item);
        const thumbUri = $(".thumb-background img", item);
        const summary = $(".listing-summary", item);
        const lengthAndLoop = $(".hike-length span", item)
          .text()
          .split(", ");
        const gain = $(".hike-gain span", item);
        const highPoint = $(".hike-highpoint span", item);
        const ratingCount = $(".rating-count", item);
        const rating = $(".current-rating", item);
        $(".trip-features", item)
          .children()
          .each((imgIndex, img) => {
            features.push(img.attribs.title);
          });
        result.id = id++;
        result.title = title.text();
        result.region = region.text();
        result.uri = uri.attr("href");
        result.thumbUri = thumbUri.attr("src");
        result.summary = summary
          .text()
          .replace("\n", "")
          .trim();
        result.features = JSON.parse(JSON.stringify(features));
        result.lengthInMiles =
          Number(lengthAndLoop[0].match(/[+-]?\d+(\.\d+)?/g)) || 0;
        result.loop = lengthAndLoop[1] || "unknown";
        result.gainInFt = Number(gain.text());
        result.highPointInFt = Number(highPoint.text());
        result.ratingCount = Number(ratingCount.text().match(/\d+/g)[0]);
        result.rating = Number(rating.text());

        const deepCopyResult = JSON.parse(JSON.stringify(result));
        results.push(deepCopyResult);
      });
    }
    done(writeData());
  }
});

const writeData = function() {
  const json = JSON.stringify(results);
  fs.writeFile("washingtonTrails.json", json, "utf8", () => {});
};

// 将多个URL加入请求队列
// c.queue(["http://www.google.com/", "http://www.yahoo.com"]);
let urls = [];
let start = 0;
while (start < 3601) {
  urls.push(
    `https://www.wta.org/go-outside/hikes/hike_search?sort=name&rating=0&mileage:float:list=0.0&mileage:float:list=25.0&title=&region=all&searchabletext=&filter=Search&subregion=all&b_start:int=${start}&show_incomplete=on&elevationgain:int:list=0&elevationgain:int:list=5000&highpoint=`
  );
  start += 30;
  console.log(start);
}
console.log(urls);
c.queue(urls);
