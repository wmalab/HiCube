import React, { useState } from "react";
import Collapsible from "../UI/Collapsible";
import classes from "./TrackSourceManager.module.css";

const TrackSourceManager = (props) => {
  const [enteredServer, setEnteredServer] = useState(
    "http://higlass.io/api/v1"
  );

  const serverInputChangeHandler = (event) => {
    setEnteredServer(event.target.value);
  };

  const addServerHandler = () => {
    // TODO: verify server URL
    props.onAddServer(enteredServer);
    setEnteredServer("");
  };

  return (
    <Collapsible title="Track Source Servers">
      {props.trackSourceServers.length === 0 && (
        <p className={classes.message}>No server, add one to continue.</p>
      )}
      <ul className={classes.serverlist}>
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
                  <ion-icon name="trash-outline"></ion-icon>
                </button>
                {trackSourceServer.url}
              </li>
            );
          })}
        <li>
          <button onClick={addServerHandler}>
            <span>
              <ion-icon name="add-outline"></ion-icon>
            </span>
          </button>
          <input
            type="text"
            value={enteredServer}
            onChange={serverInputChangeHandler}
            placeholder="Add HiGlass server URL"
          ></input>
        </li>
      </ul>
    </Collapsible>
  );
};

export default TrackSourceManager;
