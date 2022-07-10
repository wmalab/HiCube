import React, { useState, useEffect, useCallback, useMemo } from "react";
import useHttp from "../../hooks/use-http";

// Get available tilesets from API
// filter by filetype `?t={}` or datatype `?dt={}`
// additional filter by `project_name` or `coordSystem` or keywords
// use `${sourceServer}/tilesets/?limit=10000&${datatypesQuery}`
// types: filetype, datatype, tracktype
const TrackSelector = (props) => {
  const { datatype, assembly, trackSourceServers } = props;
  const [datasets, setDatasets] = useState({});
  const [selectedUuid, setSelectedUuid] = useState(null);

  // only hold the serverUidKey in an array
  const filteredDatasets = useMemo(() => {
    if (!assembly) {
      return Object.keys(datasets);
    }
    return Object.keys(datasets).filter(
      (serverUidKey) => datasets[serverUidKey].coordSystem === assembly
    );
  }, [datasets, assembly]);

  useEffect(() => {
    // if (!selectedUuid && filteredDatasets.length > 0) {
    //   setSelectedUuid(filteredDatasets[0]);
    // }
    if (filteredDatasets.length > 0) {
      if (!selectedUuid || !filteredDatasets.includes(selectedUuid)) {
        setSelectedUuid(filteredDatasets[0]);
      }
    } else {
      setSelectedUuid(null);
    }
  }, [filteredDatasets]);

  const { isLoading, error, sendRequest: fetchDatasets } = useHttp();

  const transformDatasets = useCallback((sourceServer, datatype, data) => {
    const newDatasets = data.results.map((dataset) => ({
      ...dataset,
      server: sourceServer,
      tilesetUid: dataset.uuid,
      serverUidKey: `${sourceServer}/${dataset.uuid}`,
    }));

    setDatasets((prevDatasets) => {
      let updatedDatasets = {};
      // FIXED: clean up prev datasets that have different datatype than current
      const prevKeys = Object.keys(prevDatasets);
      if (prevKeys.length > 0 && prevDatasets[prevKeys[0]].datatype === datatype) {
        updatedDatasets = { ...prevDatasets };
      }
      newDatasets.forEach((dataset) => {
        updatedDatasets[dataset.serverUidKey] = dataset;
      });
      return updatedDatasets;
    });
  }, []);

  useEffect(() => {
    if (!trackSourceServers || !datatype) {
      return;
    }
    const query = `dt=${datatype}`;
    trackSourceServers.forEach((sourceServer) => {
      console.log("fetch datasets");
      fetchDatasets(
        { url: `${sourceServer.url}/tilesets/?limit=10000&${query}` },
        transformDatasets.bind(null, sourceServer.url, datatype)
      );
    });
  }, [trackSourceServers, datatype, fetchDatasets, transformDatasets]);

  const selectDatasetHandler = (event) => {
    setSelectedUuid(event.target.value);
  };

  useEffect(() => {
    if (!selectedUuid) {
      return;
    }
    const selectedDataset = datasets[selectedUuid];
    const { server, tilesetUid, name } = selectedDataset;
    props.onDatasetChange({
      server,
      tilesetUid,
      name,
    });
  }, [selectedUuid]);

  return (
    <>
      {isLoading && <p>Loading datasets...</p>}
      {error && <p>Error: {error}</p>}
      {!isLoading && !error && filteredDatasets.length > 0 && (
        <select value={selectedUuid} onChange={selectDatasetHandler}>
          {filteredDatasets.map((serverUidKey) => (
            <option value={serverUidKey} key={serverUidKey}>
              {datasets[serverUidKey].name}
            </option>
          ))}
        </select>
      )}
    </>
  );
};

export default TrackSelector;
