import React, { useState } from "react";

const TrackSourceManager = (props) => {
  const [enteredServer, setEnteredServer] = useState(
    "http://higlass.io/api/v1"
  );

  const serverInputChangeHandler = (event) => {
    setEnteredServer(event.target.value);
  };

  const addServerHandler = () => {
    props.onAddServer(enteredServer);
    setEnteredServer("");
  };

  return (
    <div className="control-section">
      <p>
        <strong>Track source servers:</strong>
      </p>
      {props.trackSourceServers.length === 0 && (
        <p>Please add HiGlass server.</p>
      )}
      <ul>
        {props.trackSourceServers.length > 0 &&
          props.trackSourceServers.map((trackSourceServer) => {
            return (
              <li key={trackSourceServer.uuid}>
                {trackSourceServer.url}
                <button
                  onClick={props.onRemoveServer.bind(
                    null,
                    trackSourceServer.uuid
                  )}
                >
                  <ion-icon name="trash-outline"></ion-icon>
                </button>
              </li>
            );
          })}
      </ul>
      <div>
        <input
          type="text"
          value={enteredServer}
          onChange={serverInputChangeHandler}
          placeholder="Enter HiGlass server url"
        ></input>
        <button onClick={addServerHandler}>
          <span>
            <ion-icon name="add-outline"></ion-icon>
          </span>
        </button>
      </div>
    </div>
  );
};

export default TrackSourceManager;
