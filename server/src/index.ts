import express, {Request, Response} from "express";
import cors from "cors";
import fs from "fs";

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (request, file, callback) {
    callback(null, "uploaded.txt");
  },
});
const upload = multer({storage: storage});

const app = express();
app.use(cors());
const PORT = "5000";

app.get("/api", (req: Request, res: Response) => {
  res.send("hello world");
});

app.post("/api", upload.single("inputDoc"), (req: Request, res: Response) => {
  try {
    let path = __dirname.split("src").join("");
    let readStream = fs.createReadStream(
      path + "uploads" + "/uploaded.txt",
      "utf8"
    );

    let data = "";
    let array;
    let errorList: any = [];
    let warnList: any = [];
    let ISOdate: any = [];

    const parseData = () => {
      readStream
        .on("data", function (chunk) {
          data += chunk;
        })
        .on("end", function () {
          array = data.split("Z");

          array.forEach((item, i, arr) => {
            if (arr.length - 1 != i) {
              let x = item.slice(-23);
              console.log(x);
              ISOdate.push(x);
              let singleData: any[] = item.split(x);

              if (singleData[0].match(/- error -/)) {
                let data = JSON.parse(singleData[0].slice(11).trim());
                delete data.code;
                let timestamp = new Date(ISOdate[i - 1]).getTime();
                Object.assign(data, {timestamp}, {loglevel: "error"});
                errorList.push(data);
              } else if (singleData[0].match(/warn/)) {
                let data = JSON.parse(singleData[0].slice(9).trim());
                delete data.code;
                let timestamp = new Date(ISOdate[i - 1]).getTime();
                Object.assign(data, {timestamp}, {loglevel: "warn"});
                warnList.push(data);
              }
            } else {
              let x = item.slice(-23);
              let singleData: any[] = item.split(x);
              if (singleData[0].match(/- error -/)) {
                let data = JSON.parse(singleData[0].slice(11).trim());
                delete data.code;
                let timestamp = new Date(ISOdate[i - 1]).getTime();
                Object.assign(data, {timestamp}, {loglevel: "error"});
                errorList.push(data);
              } else if (singleData[0].match(/warn/)) {
                let data = JSON.parse(singleData[0].slice(9).trim());
                delete data.code;
                let timestamp = new Date(ISOdate[i - 1]).getTime();
                Object.assign(data, {timestamp}, {loglevel: "warn"});
                warnList.push(data);
              }
            }
          });

          let combineList: any = [...errorList, ...warnList];

          combineList.forEach((item: any, i: number) => {
            combineList[i] = JSON.stringify(combineList[i]);
          });

          console.log(combineList);
          setTimeout(() => {
            res
              .status(200)
              .json({data: combineList, message: "file parsed successfully"});
          }, 3000);
        });
    };
    parseData();
  } catch (err) {
    console.log(err);
    res.status(400).json({message: "file cannot parse ! something went wrong"});
  }
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
