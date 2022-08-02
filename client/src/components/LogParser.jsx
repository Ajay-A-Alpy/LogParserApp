import React, {useState} from "react";
import "../components/LogParser.css";
import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5000/api"});

function LogParser() {
  const [log, setLog] = useState();
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e) => {
    const fd = new FormData();
    fd.append("inputDoc", log);
    fd.append("message", "document uploaded");
    const upload = async () => {
      try {
        const result = await API.post("/", fd);

        const fileName = "parsed-file";
        const blob = new Blob([result.data.data], {type: "application/json"});
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        setLoading(false);
        alert(result.data.message);
      } catch (err) {
        console.log(err);
      }
    };
    upload();
    setLoading(true);
  };
  return (
    <div className="container">
      <div className="row ">
        <div className="col-md-12 mx-auto logApp  rounded-3 py-5 my-5 ">
          <h4 className="fw-bold fs-3 text-center text-success ">LOG PARSER</h4>
          <p className="fs-6 text-secondary my-3 text-center">
            UPLOAD PARSE DOWNLOAD !
          </p>
          <input
            type="file"
            aria-label="select the file"
            className="form-control my-2"
            accept=".txt"
            multiple
            name="inputDoc"
            required
            style={{marginY: "auto"}}
            onChange={(e) => {
              setLog(e.target.files[0]);
            }}
          ></input>
          <div>
            {loading ? (
              <>
                <div
                  className=" my-3 d-block mx-auto  spinner-border text-primary"
                  onClick={handleSubmit}
                ></div>
              </>
            ) : (
              <button
                className="btn btn-secondary my-3 d-block mx-auto text-white"
                onClick={handleSubmit}
              >
                Upload
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogParser;
