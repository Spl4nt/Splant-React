import { useState } from "react";
import { useWeb3Storage } from "../context/Web3StorageContext";
import { Buffer } from "buffer";

import { AudioRecorder } from "react-audio-voice-recorder";

export const Splant = () => {
  const [recordings, setRecordings] = useState([]);
  const [audioName, setAudioName] = useState("");
  const handleRecordingComplete = (audioData) => {
    const newRecording = { audioData, name: audioName };
    setRecordings([...recordings, newRecording]);
    setAudioName(""); //reset input
  };

  return (
    <div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h1 className="card-title">Record a Splant!</h1>
          <input
            type="text"
            placeholder="Enter Splant Name"
            className="input input-bordered input-secondary w-full max-w-xs"
            value={audioName}
            onChange={(e) => setAudioName(e.target.value)}
          />
          <div className="card-actions">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              audioTrackConstraints={{
                noiseSuppression: true,
                echoCancellation: true,
              }}
              downloadOnSavePress={false}
              showVisualizer={true}
              downloadFileExtension="mp3"
            />
          </div>
        </div>
      </div>
      <SplantDisplay recordings={recordings} />
    </div>
  );
};

const SplantDisplay = ({ recordings }) => {
  return (
    <div className="shadow-xl">
      {recordings.map((recording, index) => (
        <SplantDisplayItem recording={recording} />
      ))}
    </div>
  );
};
const SplantDisplayItem = ({ recording }) => {
  const { audioData, name } = recording;
  const [cid, setCID] = useState("");
  const web3StorageClient = useWeb3Storage();

  const url = URL.createObjectURL(audioData);

  async function uploadAudio(data) {
    const { audioData, name } = data;

    const file = new File([audioData], `${name}.mp3`);

    const cid = await web3StorageClient.store([file]);

    const schema = {
      contentSize: "uint64",
      mediaType: "Audio",
      encodingFormat: "Mp3",
      name,
      contentHash: cid,
    };

    console.log(schema, "schema");
    setCID(cid);
    return cid;
  }

  return (
    <div>
      <div className="collapse-title text-xl bg-primary font-medium shadow-xl">
        {name} - {cid ? " Saved" : " Draft"}
      </div>
      <div className=" text-xl font-medium">{cid ? cid : null}</div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          padding: "20px",
        }}
      >
        <audio src={url} controls={true} />
        <div className="btn-group">
          <button
            className="btn btn-info"
            onClick={() => uploadAudio(recording)}
          >
            Save
          </button>
        </div>
      </div>
      <br />
    </div>
  );
};
