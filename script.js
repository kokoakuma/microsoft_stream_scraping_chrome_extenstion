// リスナー登録
document.addEventListener('keypress', main);

// メイン処理
function main(e){
  // Mキーで発火
  if(e.code != 'KeyM'){
		return;
	}

  // get elements array
  const videoTitleList = Array.from(document.getElementsByClassName("video-title"));
  const videoViewCountList = Array.from(document.getElementsByClassName("view-count"));
  const videoPublishedDateList = Array.from(document.getElementsByClassName("published-date-column"));

  // create new CSV file and show download window
  const generator = new CSVGenerator(videoTitleList, videoViewCountList, videoPublishedDateList);
  const blob = generator.getCSVBlob();
  showDownloadWindow(blob);
  console.log("successfully created csv!")
}

/** @param {Blob} blob */
function showDownloadWindow(blob){
  const now = new Date()
  // e.x. 2022-10-31-103020.csv
  const nowString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDay()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${nowString}.csv`;
  link.click();
}

// class definition
/**
 * published date class which is formatted as dd/mm/yyyy e.x. 8/9/2022
 */
class PublishedDate {
  // expects mm/dd/yyyy
  constructor(_date) {
    if (typeof _date != "string") {
      throw new Error("Illegal argument was supplied! This constructor takes only string.");
    }

    const [_month, _day, _year] = _date.split("/");
    const isMonthValid = _month.length >= 1 && _month.length <= 2
    const isDayValid = _day.length >= 1 && _day.length <= 2
    const isYearValid = _year.length === 4
    if (!isMonthValid || !isDayValid || !isYearValid) {
      throw new SyntaxError("This constructor takes only format mm/dd/yyyy.");
    }

    /** @type {string} */
    this._month = _month;
    /** @type {string} */
    this._day = _day;
    /** @type {string} */
    this._year = _year;
  }

  // return yyyy/mm/dd
  getDateAsString() {
    return `${this._year}/${this._month}/${this._day}`;
  }

  getDateAsMillisecond() {
    const date = new Date(this._year, this._month - 1, this._day)
    return date.getTime();
  }
}

/**
 * Stream video class
 */
class Video {
  static keys = ["title", "viewCount", "date"];

  constructor(_title, _viewCount, _date) {
    const isTitleValid = typeof _title == "string";
    const isViewCountValid = typeof _viewCount == "string";
    const isDateValid = _date instanceof PublishedDate;
    if (!isTitleValid || !isViewCountValid || !isDateValid) {
      throw new Error("Illegal argument was supplied! this constructor takes only string{title}, string{viewCount}, PublishedDate{date}.");
    }

    /** @type {string} */
    this._title = _title;
    /** @type {string} */
    this._viewCount = _viewCount;
    /** @type {PublishedDate} */
    this._date = _date;
  }

  get date() {
    return this._date;
  }

  getValueAsCsv() {
    return `${this._title},${this._viewCount},${this._date.getDateAsString()}`;
  }
}

class CSVGenerator {
  bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  constructor(_titleList, _viewCountList, _dateList) {
    const isTitleValid = Array.isArray(_titleList);
    const isViewCountValid = Array.isArray(_viewCountList);
    const isDateValid = Array.isArray(_dateList);
    if (!isTitleValid || !isViewCountValid || !isDateValid) {
      throw new Error("Illegal argument was supplied! This constructor takes only array.");
    }
    if (_titleList.length != _viewCountList.length|| _titleList.length != _dateList.length) {
      throw new Error("The length of arguments are not same.");
    }

    /** @type {Array<Video>} */
    this._videos = [];

    for (var i = 0; i < _titleList.length; i++) {
      const title = _titleList[i].innerText;
      const viewCount = _viewCountList[i].innerText;
      const date = new PublishedDate(_dateList[i].innerText);
      const newVideo = new Video(title, viewCount, date);

      this._videos.push(newVideo);
    }
  }

  /** @return {Array<Video>} */
  getAsAscendingOrder() {
    return this._videos.slice().sort((prev, next) => {
      return prev.date.getDateAsMillisecond() - next.date.getDateAsMillisecond();
    });
  }

  toCSVFormatString() {
    let csvString = Video.keys.join(",") + "\n";
    this.getAsAscendingOrder().map( video => {
      csvString += `${video.getValueAsCsv()}\n`;
    });

    return csvString;
  }

  getCSVBlob() {
    const csvString = this.toCSVFormatString()
    return new Blob([this.bom, csvString],{type:"text/plan"});
  }
}
