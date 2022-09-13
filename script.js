// リスナー登録
document.addEventListener('keypress', main);

// メイン処理
function main(e){
  // Mキーで発火
  if(e.code != 'KeyM'){
		return;
	}

  const videoTitleList = document.getElementsByClassName("video-title")
  const videoViewCountList = document.getElementsByClassName("view-count")
  const videoPublishedDateList = document.getElementsByClassName("published-date-column")

  const generator = new CSVGenerator(videoTitleList, videoViewCountList, videoPublishedDateList);
  const blob = generator.getCSVBlob();
  showDownloadWindow(blob);
  console.log("successfully created csv!")
}

function showDownloadWindow(blob){
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'test.csv';
  link.click();
}

// クラス
class PublishedDate {
  // expected mm/dd/yyyy
  constructor(date) {
    [this._month, this._day, this._year] = date.split("/");
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

class Video {
  static keys = ["title", "viewCount", "date"];

  constructor(title, viewCount, date) {
    this._title = title;
    this._viewCount = viewCount;
    this._date = new PublishedDate(date);
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
  constructor(titleList, viewCountList, dateList) {
    this._videos = [];
    if (titleList.length != viewCountList.length|| titleList.length != dateList.length) {
        return;
    }

    for (var i = 0; i < titleList.length; i++) {
      const title = titleList[i].innerText;
      const viewCount = viewCountList[i].innerText;
      const date = dateList[i].innerText;
      const newVideo = new Video(title, viewCount, date);

      this._videos.push(newVideo);
    }
  }

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
