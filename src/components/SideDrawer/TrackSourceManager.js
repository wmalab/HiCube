import React, { useState } from "react";

const TrackSourceManager = (props) => {
  const [enteredServer, setEnteredServer] = useState();

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
                <button
                  onClick={props.onRemoveServer.bind(
                    null,
                    trackSourceServer.uuid
                  )}
                >
                  -
                </button>
                {trackSourceServer.url}
              </li>
            );
          })}
      </ul>
      <div>
        <button onClick={addServerHandler}>+ Server</button>
        <input
          type="text"
          value={enteredServer}
          onChange={serverInputChangeHandler}
        ></input>
      </div>
    </div>
  );
};

export default TrackSourceManager;
