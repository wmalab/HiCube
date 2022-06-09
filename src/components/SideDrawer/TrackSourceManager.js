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
    <div>
      <p>Track source servers:</p>
      <ul>
        {props.trackSourceServers.length === 0 && <p>No server found.</p>}
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
        <label>Server URL:</label>
        <input
          type="text"
          value={enteredServer}
          onChange={serverInputChangeHandler}
        ></input>
        <button onClick={addServerHandler}>
          <span>
            <ion-icon name="add-circle-outline"></ion-icon>
          </span>
          <span>Server</span>
        </button>
      </div>
    </div>
  );
};

export default TrackSourceManager;
