import React, { useState, useEffect } from "react";
import Collapsible from "../UI/Collapsible";
import useHttp from "../../hooks/use-http";
import classes from "./TrackSourceManager.module.css";

const TrackSourceManager = (props) => {
  const [enteredServer, setEnteredServer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { isLoading, error, sendRequest: validateServer } = useHttp();

  useEffect(() => {
    setErrorMsg(error);
  }, [error]);

  const serverInputChangeHandler = (event) => {
    setEnteredServer(event.target.value);
  };

  const focusHandler = (event) => {
    setErrorMsg("");
  };

  const addServer = (data) => {
    props.onAddServer(enteredServer.trim());
    setEnteredServer("");
  };

  const addServerHandler = () => {
    if (enteredServer.trim() === "") {
      setErrorMsg("Empty");
      return;
    }
    // verify server URL is higlass API server
    validateServer({ url: `${enteredServer.trim()}/tilesets` }, addServer);
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
                  disabled={props.trackSourceServers.length === 1}
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
            onFocus={focusHandler}
            placeholder="Enter HiGlass API server URL"
          ></input>
          {errorMsg && (
            <div className={classes.error}>
              <p>Invalid server: {errorMsg}</p>
            </div>
          )}
        </li>
      </ul>
      <div className={classes.example}>
        <p>Example:</p>
        <p>http://higlass.io/api/v1</p>
        <p>http://localhost:8888/api/v1</p>
      </div>
    </Collapsible>
  );
};

export default TrackSourceManager;
